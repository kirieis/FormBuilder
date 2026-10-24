import mammoth from "mammoth";
import JSZip from "jszip";
import { XMLParser, XMLValidator } from "fast-xml-parser";

export type SupportedFileType = "txt" | "md" | "docx" | "pptx";

export type ExtractedSection = {
    title: string;
    text: string;
    index: number;
};

export type ExtractedDocument = {
    fileName: string;
    fileType: SupportedFileType;
    rawText: string;
    sections: ExtractedSection[];
    wordCount: number;
    slideCount?: number;
};

const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: false,
});

function getFileType(fileName: string): SupportedFileType {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (
        extension === "txt" ||
        extension === "md" ||
        extension === "docx" ||
        extension === "pptx"
    ) {
        return extension;
    }

    throw new Error(
        `"${fileName}" has an unsupported format. Supported formats: .txt, .md, .docx, .pptx.`,
    );
}

function countWords(text: string): number {
    const trimmed = text.trim();

    return trimmed ? trimmed.split(/\s+/u).length : 0;
}

function createSectionsFromText(text: string): ExtractedSection[] {
    const lines = text.replace(/\r\n?/g, "\n").split("\n");
    const sections: ExtractedSection[] = [];

    let currentTitle = "Section 1";
    let currentLines: string[] = [];

    function flushSection() {
        const sectionText = currentLines.join("\n").trim();

        if (sectionText) {
            sections.push({
                title: currentTitle,
                text: sectionText,
                index: sections.length + 1,
            });
        }

        currentLines = [];
    }

    for (const line of lines) {
        const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);

        if (headingMatch) {
            flushSection();
            currentTitle = headingMatch[2].trim();
            continue;
        }

        if (!line.trim()) {
            flushSection();

            if (sections.length > 0) {
                currentTitle = `Section ${sections.length + 1}`;
            }

            continue;
        }

        currentLines.push(line);
    }

    flushSection();

    return sections;
}

function extractXmlText(value: unknown): string {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map(extractXmlText).join("");
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;

        if (Object.prototype.hasOwnProperty.call(record, "#text")) {
            return extractXmlText(record["#text"]);
        }

        return Object.values(record).map(extractXmlText).join("");
    }

    return "";
}

function collectPowerPointText(
    value: unknown,
    output: string[],
): void {
    if (Array.isArray(value)) {
        for (const item of value) {
            collectPowerPointText(item, output);
        }

        return;
    }

    if (!value || typeof value !== "object") {
        return;
    }

    const record = value as Record<string, unknown>;

    for (const [key, child] of Object.entries(record)) {
        if (key === "a:t") {
            const text = extractXmlText(child);

            if (text) {
                output.push(text);
            }
        } else {
            collectPowerPointText(child, output);
        }
    }
}

function createSectionsFromDocxHtml(html: string): ExtractedSection[] {
    const document = new DOMParser().parseFromString(html, "text/html");
    const elements = document.body.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, li, blockquote",
    );

    const sections: ExtractedSection[] = [];

    let currentTitle = "Section 1";
    let currentParagraphs: string[] = [];

    function flushSection() {
        const text = currentParagraphs.join("\n").trim();

        if (text) {
            sections.push({
                title: currentTitle,
                text,
                index: sections.length + 1,
            });
        }

        currentParagraphs = [];
    }

    for (const element of Array.from(elements)) {
        // Avoid collecting both a list item and its nested paragraph.
        if (element.closest("li") && element.tagName !== "LI") {
            continue;
        }

        const text = element.textContent?.trim() ?? "";

        if (!text) continue;

        if (/^H[1-6]$/.test(element.tagName)) {
            flushSection();
            currentTitle = text;
        } else {
            currentParagraphs.push(text);
        }
    }

    flushSection();

    return sections;
}

async function extractTextFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();

    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
        throw new Error(
            `"${file.name}" is not valid UTF-8 text or contains unreadable characters.`,
        );
    }
}

async function extractDocx(
    file: File,
): Promise<{ rawText: string; sections: ExtractedSection[] }> {
    const arrayBuffer = await file.arrayBuffer();

    try {
        const [textResult, htmlResult] = await Promise.all([
            mammoth.extractRawText({ arrayBuffer }),
            mammoth.convertToHtml({ arrayBuffer }),
        ]);

        const rawText = textResult.value.trim();

        if (!rawText) {
            throw new Error(`"${file.name}" contains no extractable text.`);
        }

        let sections = createSectionsFromDocxHtml(htmlResult.value);

        if (sections.length === 0) {
            sections = createSectionsFromText(rawText);
        }

        return { rawText, sections };
    } catch (error) {
        if (error instanceof Error && error.message.includes("contains no extractable text")) {
            throw error;
        }

        throw new Error(
            `Could not read "${file.name}". The Word document may be damaged or have an invalid format.`,
        );
    }
}

async function extractPptx(
    file: File,
): Promise<{
    rawText: string;
    sections: ExtractedSection[];
    slideCount: number;
}> {
    let zip: JSZip;

    try {
        zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch {
        throw new Error(
            `"${file.name}" is not a valid PowerPoint ZIP package or is damaged.`,
        );
    }

    const slideFiles = Object.keys(zip.files)
        .map((path) => {
            const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);

            return match
                ? { path, number: Number(match[1]) }
                : null;
        })
        .filter(
            (item): item is { path: string; number: number } => item !== null,
        )
        .sort((a, b) => a.number - b.number);

    if (slideFiles.length === 0) {
        throw new Error(
            `"${file.name}" does not contain any readable PowerPoint slides.`,
        );
    }

    const sections: ExtractedSection[] = [];

    for (const slide of slideFiles) {
        const zipEntry = zip.file(slide.path);

        if (!zipEntry) continue;

        let xml: string;

        try {
            xml = await zipEntry.async("string");
        } catch {
            throw new Error(
                `Could not read slide ${slide.number} in "${file.name}".`,
            );
        }

        if (XMLValidator.validate(xml) !== true) {
            throw new Error(
                `Slide ${slide.number} in "${file.name}" contains invalid XML.`,
            );
        }

        const parsedXml: unknown = parser.parse(xml);
        const textParts: string[] = [];

        collectPowerPointText(parsedXml, textParts);

        sections.push({
            title: `Slide ${slide.number}`,
            text: textParts.join("").trim(),
            index: slide.number,
        });
    }

    const rawText = sections
        .filter((section) => section.text)
        .map((section) => `${section.title}\n${section.text}`)
        .join("\n\n")
        .trim();

    if (!rawText) {
        throw new Error(
            `"${file.name}" contains no extractable slide text.`,
        );
    }

    return {
        rawText,
        sections,
        slideCount: slideFiles.length,
    };
}

export async function extractDocument(
    file: File,
): Promise<ExtractedDocument> {
    const fileType = getFileType(file.name);

    if (file.size === 0) {
        throw new Error(`"${file.name}" is empty.`);
    }

    let rawText = "";
    let sections: ExtractedSection[] = [];
    let slideCount: number | undefined;

    switch (fileType) {
        case "txt":
        case "md": {
            rawText = await extractTextFile(file);

            if (!rawText.trim()) {
                throw new Error(`"${file.name}" contains no text.`);
            }

            sections = createSectionsFromText(rawText);
            break;
        }

        case "docx": {
            const result = await extractDocx(file);
            rawText = result.rawText;
            sections = result.sections;
            break;
        }

        case "pptx": {
            const result = await extractPptx(file);
            rawText = result.rawText;
            sections = result.sections;
            slideCount = result.slideCount;
            break;
        }
    }

    const result: ExtractedDocument = {
        fileName: file.name,
        fileType,
        rawText,
        sections,
        wordCount: countWords(rawText),
    };

    if (slideCount !== undefined) {
        result.slideCount = slideCount;
    }

    return result;
}