# Kế hoạch 10 ngày --- AI Report Builder

## Phiên bản dành cho người phát triển bằng ChatGPT, không dùng AI Agent trong IDE

> Mục tiêu: xây dựng một MVP chạy được, có thể upload tài liệu, trích
> xuất nội dung, tạo báo cáo bằng API AI ở gói miễn phí, chỉnh sửa
> Markdown, lưu lịch sử và xuất PDF.
>
> **Cách dùng kế hoạch:** mỗi ngày có các prompt để gửi lần lượt vào
> ChatGPT. Làm từng prompt một, áp dụng code vào dự án rồi mới chuyển
> tiếp. Không yêu cầu ChatGPT tạo hoặc sửa toàn bộ dự án trong một lần.

------------------------------------------------------------------------

## 1. Quy tắc làm việc khi chỉ dùng AI Chat

Vì ChatGPT không trực tiếp nhìn thấy toàn bộ thư mục dự án hoặc tự chạy
lệnh trong IDE của bạn, cần làm theo quy trình này:

1.  **Khởi đầu mỗi phiên:** gửi cấu trúc thư mục hiện tại,
    `package.json`, các file liên quan và lỗi terminal nếu có. Không cần
    gửi `node_modules`, `.next`, file build hoặc `.env.local`.
2.  **Làm từng bước nhỏ:** mỗi lần chỉ yêu cầu một tính năng hoặc một
    nhóm file liên quan. Đợi ChatGPT trả lời xong, áp dụng code, chạy
    thử rồi mới sang bước tiếp theo.
3.  **Yêu cầu trả lời theo file:** ChatGPT phải ghi rõ đường dẫn file,
    file nào tạo mới, file nào thay thế, và cung cấp nội dung hoàn chỉnh
    của từng file cần sửa. Không chấp nhận đoạn code rời mà không chỉ rõ
    vị trí chèn.
4.  **Không ghi đè mù quáng:** trước khi thay file đang tồn tại, gửi nội
    dung file hiện tại để ChatGPT chỉnh sửa dựa trên code thật. Giữ bản
    sao hoặc commit Git trước các thay đổi lớn.
5.  **Kiểm tra sau mỗi bước:** chạy lệnh kiểm tra được nêu trong prompt,
    ví dụ `npm run dev`, `npm run lint`, `npx tsc --noEmit` hoặc test
    tương ứng. Nếu lỗi, gửi nguyên văn lỗi và file liên quan lại
    ChatGPT.
6.  **Không giả định ChatGPT đã chạy code:** chỉ xem tính năng là hoàn
    thành sau khi bạn chạy thử trên máy. ChatGPT không được tuyên bố đã
    build/test thành công nếu chưa có kết quả thực tế.
7.  **Giữ một bản tóm tắt dự án:** sau mỗi ngày, yêu cầu ChatGPT cập
    nhật trạng thái gồm cấu trúc, file đã sửa, lệnh đã chạy, lỗi còn lại
    và bước tiếp theo. Lưu bản tóm tắt này vào `PROJECT_STATUS.md` hoặc
    một ghi chú riêng để đưa vào phiên chat mới.
8.  **Không gửi bí mật:** không dán API key thật, mật khẩu, token, dữ
    liệu riêng tư hoặc tài liệu nhạy cảm vào chat. Dùng placeholder khi
    chia sẻ `.env.example`.
9.  **Dùng Git:** nếu có thể, tạo commit sau mỗi ngày hoàn thành. Nếu
    chưa quen Git, ít nhất hãy sao lưu thư mục dự án trước khi thay
    nhiều file.
10. **Nếu câu trả lời quá dài:** yêu cầu ChatGPT chia thành từng phần và
    chỉ bắt đầu phần tiếp theo khi bạn đã áp dụng, kiểm tra phần trước.

### Prompt nền --- dán đầu phiên chat mới

``` text
Bạn là trợ lý lập trình cho dự án AI Report Builder. Tôi đang phát triển bằng cách trò chuyện với ChatGPT và tự sao chép code vào IDE; bạn không có quyền trực tiếp xem toàn bộ project hoặc chạy lệnh trên máy tôi trừ khi tôi cung cấp nội dung/kết quả.

Quy tắc làm việc:
1. Làm từng bước nhỏ, không tạo lại toàn bộ dự án khi chưa cần.
2. Trước khi sửa file đang tồn tại, yêu cầu tôi gửi nội dung file nếu bạn chưa có.
3. Với mỗi thay đổi, nêu rõ đường dẫn file, mục đích, tạo mới hay thay thế, và đưa nội dung file hoàn chỉnh khi phù hợp.
4. Giữ nguyên các phần không liên quan; không tự ý đổi thư viện, kiến trúc hoặc tên file.
5. Không bịa kết quả chạy lệnh. Hãy chỉ định lệnh để tôi chạy và chờ tôi gửi kết quả.
6. Ưu tiên giải pháp đơn giản, dễ hiểu, phù hợp với người đang học.
7. Nếu phát hiện yêu cầu có xung đột với code hiện tại, hãy giải thích và đề xuất thay đổi nhỏ nhất trước khi viết code.
8. Mọi nội dung hiển thị cho người dùng trong ứng dụng phải bằng tiếng Anh.
9. AI phải dùng API ở gói miễn phí, không tự động chuyển sang API/model trả phí.
10. Cuối mỗi bước, liệt kê file đã tạo/sửa, cách kiểm tra và những việc chưa làm.

Trước khi bắt đầu, hãy hỏi tôi về cấu trúc thư mục và các file liên quan nếu chúng chưa được cung cấp.
```

------------------------------------------------------------------------

## 2. Phạm vi MVP và những gì để sau

### MVP cần hoàn thành

-   Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui.
-   Upload nhiều file `.txt`, `.md`, `.docx`, `.pptx`, giới hạn tổng
    dung lượng.
-   Trích xuất text từ file và hiển thị nội dung đã đọc.
-   Tạo báo cáo Markdown bằng một AI API có free tier.
-   Streaming nếu SDK/provider hỗ trợ ổn định; nếu khó xử lý, ưu tiên
    phiên bản trả kết quả hoàn chỉnh trước.
-   Chọn loại báo cáo, chỉnh sửa Markdown và xem preview.
-   Lưu báo cáo cục bộ bằng IndexedDB.
-   Xuất PDF hỗ trợ tiếng Việt.
-   Xử lý lỗi cơ bản, kiểm thử và triển khai nếu đủ thời gian.

### Để sau khi MVP chạy ổn định

-   So sánh nhiều tài liệu bằng AI.
-   Xử lý tài liệu cực dài bằng nhiều lượt gọi AI.
-   Share link giữa nhiều người/thiết bị.
-   Tự động tạo mục lục PDF phức tạp, nhiều theme, watermark, logo.
-   RAG, đăng nhập, đồng bộ cloud, batch export.
-   Nhiều AI provider cùng lúc. Chỉ thêm provider thứ hai nếu thật sự
    cần.

------------------------------------------------------------------------

# Ngày 1 --- Khởi tạo dự án và thiết lập AI miễn phí

## Prompt 1 --- Khảo sát trước khi tạo project

``` text
Tôi muốn xây dựng AI Report Builder bằng Next.js App Router và TypeScript. Tôi đang thao tác thủ công qua ChatGPT, không dùng agent trong IDE.

Trước tiên, đừng viết toàn bộ dự án. Hãy hướng dẫn tôi kiểm tra:
1. Node.js và npm đã cài đúng chưa.
2. Dự án hiện tại đã tồn tại chưa.
3. Nếu chưa có project, đưa lệnh tạo Next.js với TypeScript, Tailwind CSS và App Router.
4. Đề xuất cấu trúc thư mục tối thiểu cho MVP: app, components, lib, types.
5. Đưa từng lệnh theo đúng thứ tự và giải thích ngắn gọn kết quả mong đợi.

Chỉ làm bước khởi tạo. Sau đó chờ tôi gửi kết quả terminal trước khi chuyển sang bước tiếp.
```

## Prompt 2 --- Tạo layout nền tảng

``` text
Dựa trên cấu trúc project và package.json tôi gửi, hãy tạo layout cơ bản cho AI Report Builder.

Yêu cầu:
- Next.js App Router + TypeScript.
- Giao diện tiếng Anh.
- Header và navigation đơn giản, responsive.
- Các trang/route tối thiểu: trang upload, trang report editor, trang history.
- Dùng các component shadcn/ui khi phù hợp.
- Không thêm thư viện không cần thiết.
- Không tạo tính năng AI hoặc parser ở bước này.

Hãy liệt kê file cần tạo/sửa, cung cấp nội dung hoàn chỉnh từng file và lệnh kiểm tra. Không sửa các file ngoài phạm vi nếu không cần thiết.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích Next.js App Router theo góc nhìn người mới xây dựng AI Report Builder:
1. App Router, page.tsx, layout.tsx và Route Handler là gì?
2. Server Component và Client Component khác nhau thế nào?
3. Vì sao API key phải được giữ ở server?
4. Cách đọc lỗi npm/dev server và cách gửi thông tin lỗi để nhờ ChatGPT hỗ trợ.

Dùng ví dụ ngắn, không giả định tôi đã biết nhiều về Next.js.
```

------------------------------------------------------------------------

# Ngày 2 --- Upload và đọc nội dung file

## Prompt 1 --- UI upload file

``` text
Hãy xây dựng tính năng upload file cho project hiện tại. Trước khi sửa, hãy xem các file liên quan mà tôi gửi và giữ nguyên cấu trúc đang dùng.

Yêu cầu:
- Hỗ trợ .txt, .md, .docx, .pptx.
- Kéo thả hoặc bấm để chọn file.
- Upload nhiều file; hiển thị tên, định dạng, dung lượng và nút xóa từng file.
- Giới hạn tổng dung lượng mặc định 50 MB, có thông báo lỗi rõ ràng bằng tiếng Anh.
- Kiểm tra cả phần mở rộng và loại file ở mức phù hợp; không chỉ tin vào tên file.
- Chưa gọi AI ở bước này.
- Giao diện responsive và có trạng thái rỗng/loading/lỗi.

Hãy chỉ tạo/sửa các file cần thiết, đưa nội dung file hoàn chỉnh và hướng dẫn tôi kiểm tra bằng trình duyệt.
```

## Prompt 2 --- Parse file

``` text
Hãy thêm khả năng trích xuất text từ các file đã upload trong project hiện tại.

Yêu cầu:
- .txt và .md: đọc text UTF-8.
- .docx: dùng mammoth để trích xuất text/HTML phù hợp.
- .pptx: dùng thư viện đọc ZIP/XML phù hợp để trích xuất text theo từng slide. Không dùng pptxgenjs làm thư viện đọc file nếu thư viện đó không hỗ trợ use case này.
- Trả về kiểu dữ liệu thống nhất, gồm fileName, fileType, rawText, sections và wordCount; slideCount nếu có thể xác định.
- Xử lý file rỗng, nội dung không đọc được và lỗi định dạng.
- Không gửi nội dung lên bất kỳ API AI nào.
- Hiển thị preview text đã trích xuất để tôi kiểm tra.

Trước tiên đề xuất thư viện phù hợp và lý do. Sau khi tôi xác nhận hoặc cung cấp package.json, hãy đưa lệnh cài đặt và các file cần sửa.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích cấu trúc bên trong của .docx và .pptx, cách trích xuất text từ ZIP/XML, mammoth làm gì, và tại sao đọc được file không có nghĩa là trích xuất hoàn hảo toàn bộ bảng/hình ảnh. Dùng ví dụ gắn với AI Report Builder.
```

------------------------------------------------------------------------

# Ngày 3 --- Tích hợp AI API có gói miễn phí

## Prompt 1 --- Thiết lập Gemini API

``` text
Hãy tích hợp Google Gemini API vào project AI Report Builder hiện tại, chỉ dùng cấu hình free-tier và không tự động chuyển sang dịch vụ/model trả phí.

Trước khi viết code:
1. Kiểm tra các file hiện có mà tôi gửi, nhất là package.json, route liên quan và file .env.example.
2. Nêu rõ các file cần tạo/sửa.
3. Nếu model ID hoặc API SDK có thể đã thay đổi, yêu cầu tôi kiểm tra tài liệu chính thức hoặc cung cấp thông tin model hiện khả dụng; không bịa model ID.

Yêu cầu:
- Dùng SDK chính thức @google/genai.
- Tạo server-side module /lib/ai-client.ts.
- Dùng GEMINI_API_KEY và GEMINI_MODEL trong biến môi trường.
- Tạo POST Route Handler tại /app/api/generate-report/route.ts.
- API key không được xuất hiện ở client bundle, log hoặc response.
- Kiểm tra input rỗng, loại báo cáo không hợp lệ và giới hạn kích thước đầu vào.
- Xử lý lỗi xác thực, lỗi mạng, timeout, HTTP 429/quota hết và response rỗng.
- Không tự động retry vô hạn, không tự bật billing và không fallback sang API trả phí.
- Nếu streaming quá phức tạp ở bước đầu, hãy làm bản trả kết quả hoàn chỉnh trước, kiểm tra ổn định rồi mới thêm streaming.

Hãy đưa code theo từng file, lệnh cài đặt và cách kiểm thử. Không khẳng định đã chạy thành công khi tôi chưa gửi kết quả.
```

## Prompt 2 --- Form tạo báo cáo bản tối thiểu

``` text
Dựa trên AI client và route hiện tại mà tôi gửi, hãy nối UI upload với API tạo báo cáo.

Yêu cầu:
- Người dùng chọn một file đã parse và loại báo cáo: Summary, Analysis, Presentation hoặc Custom.
- Với Custom, có ô nhập yêu cầu bổ sung.
- Gửi nội dung đã parse đến API route server-side.
- Hiển thị loading, nội dung kết quả Markdown, lỗi và nút thử lại khi phù hợp.
- Có nút Cancel nếu request có thể được hủy an toàn.
- Không tự gọi AI lại khi người dùng chỉ chuyển tab hoặc mở lại trang.
- Không tự động gửi lại khi nhận lỗi quota.
- Tất cả text hiển thị trong UI bằng tiếng Anh.

Chỉ sửa những file cần thiết dựa trên code thật tôi cung cấp. Hướng dẫn test một trường hợp thành công và một trường hợp lỗi.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích API key, request/response, model ID, token, context window, rate limit, quota và HTTP 429. Phân biệt rõ quota do nhà cung cấp quản lý với giới hạn mà ứng dụng tự đặt. Giải thích tại sao gói miễn phí không có nghĩa là sử dụng vô hạn hoặc chắc chắn luôn khả dụng.
```

------------------------------------------------------------------------

# Ngày 4 --- Prompt template, Markdown editor và preview

## Prompt 1 --- Chuẩn hóa đầu ra báo cáo

``` text
Hãy xây dựng prompt template cho AI Report Builder tại /lib/report-prompts.ts dựa trên code hiện tại.

Các loại:
- summary: tóm tắt nội dung.
- analysis: phân tích và rút ra nhận định có căn cứ.
- presentation: sắp xếp nội dung theo cấu trúc dễ chuyển thành slide.
- custom: làm theo yêu cầu bổ sung của người dùng.

Yêu cầu:
- Output là Markdown có heading, danh sách và bảng khi thực sự hữu ích.
- Không bịa dữ kiện, nguồn trích dẫn hoặc số liệu không có trong tài liệu.
- Giữ nguyên tên riêng, con số và thuật ngữ quan trọng.
- Cho phép chọn độ dài ngắn/vừa/dài.
- Hạn chế prompt dài không cần thiết để tiết kiệm quota.
- Không tự chia thành nhiều request AI nếu nội dung vẫn nằm trong giới hạn cho phép.
- Xử lý nội dung rỗng và loại báo cáo không hợp lệ.

Trước khi sửa, hãy đọc các file AI client/route/prompt hiện tại mà tôi cung cấp. Tránh tạo logic trùng lặp.
```

## Prompt 2 --- Markdown editor và preview

``` text
Hãy triển khai ReportEditor cho ứng dụng hiện tại.

Yêu cầu:
- Có chế độ Edit và Preview.
- Dùng react-markdown và remark-gfm để hiển thị headings, lists, tables và code blocks.
- Có các thao tác cơ bản: bold, italic, heading và bullet list; không cần xây dựng editor phức tạp.
- Hiển thị word count.
- Có nút khôi phục bản AI gốc.
- Không render HTML không tin cậy bằng dangerouslySetInnerHTML.
- Bản nháp cần được giữ khi người dùng chuyển trang hoặc refresh; ở bước này có thể dùng lưu trữ cục bộ phù hợp, sau đó sẽ chuẩn hóa ở ngày 7.
- Giao diện và thông báo bằng tiếng Anh.

Hãy kiểm tra thư viện hiện có trước khi cài thêm dependency. Chỉ sửa các file liên quan đến editor và preview.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích Markdown, react-markdown, remark-gfm, cách render bảng/headings, XSS và vì sao không nên render HTML từ AI một cách không kiểm soát. Dùng ví dụ trong báo cáo do AI tạo.
```

------------------------------------------------------------------------

# Ngày 5 --- Xuất PDF

## Prompt 1 --- Chọn và triển khai một cách xuất PDF

``` text
Hãy thêm chức năng xuất báo cáo hiện tại ra PDF. Trước khi chọn thư viện, kiểm tra cấu trúc project và cách Markdown đang được render.

MVP yêu cầu:
- Xuất đúng nội dung báo cáo đã chỉnh sửa.
- Hỗ trợ tiếng Việt bằng font Unicode phù hợp.
- Có tiêu đề báo cáo và ngày tạo.
- Ngắt trang hợp lý ở mức thư viện hỗ trợ.
- Nút Export PDF có loading và thông báo lỗi/thành công bằng tiếng Anh.
- Hoạt động trên môi trường deploy mục tiêu.

Chỉ chọn một phương án đơn giản và phù hợp nhất. Không cài đồng thời nhiều thư viện PDF. Giải thích trade-off ngắn gọn trước khi triển khai. Chưa cần watermark, logo, nhiều theme hay mục lục tự động.

Đưa nội dung đầy đủ của các file cần tạo/sửa và các bước kiểm thử PDF tiếng Việt.
```

## Prompt 2 --- Kiểm tra chất lượng PDF

``` text
Tôi sẽ cung cấp code export PDF hiện tại và một số ảnh chụp/kết quả PDF. Hãy kiểm tra các vấn đề về font tiếng Việt, heading, danh sách, bảng, ngắt trang và nội dung bị cắt.

Ưu tiên sửa lỗi nhìn thấy được và lỗi tái hiện được. Không tự thêm tính năng mới nếu chưa cần. Với mỗi vấn đề, nêu nguyên nhân có khả năng xảy ra, file liên quan và bản sửa cụ thể.
```

## Prompt 3 --- Học kiến thức

``` text
So sánh ngắn gọn các cách tạo PDF trong web: @react-pdf/renderer, jsPDF và chuyển HTML sang PDF bằng browser headless. Giải thích vì sao font tiếng Việt và ngắt trang khó xử lý, và vì sao nên chọn một phương án phù hợp thay vì trộn nhiều thư viện.
```

------------------------------------------------------------------------

# Ngày 6 --- UX, trạng thái và xử lý lỗi

## Prompt 1 --- Loading và error states

``` text
Hãy rà soát các luồng upload, parse, generate report và export PDF hiện tại. Chỉ ra trạng thái loading, empty, success và error nào đang thiếu.

Sau đó triển khai các cải thiện tối thiểu:
- Toast/thông báo bằng tiếng Anh.
- Nút bị disable đúng lúc đang xử lý.
- Thông báo lỗi dễ hiểu, có hướng xử lý tiếp theo.
- Lỗi AI quota/rate limit không bị hiển thị như lỗi parse file.
- Nút retry chỉ xuất hiện khi hợp lý; không tự gửi request liên tục.
- Confirmation khi xóa file hoặc reset nội dung chưa lưu.
- Giữ nguyên logic đang hoạt động.

Hãy xử lý từng nhóm file nhỏ, cung cấp nội dung file hoàn chỉnh và hướng dẫn test từng trạng thái.
```

## Prompt 2 --- Responsive và accessibility

``` text
Kiểm tra giao diện AI Report Builder hiện tại trên desktop và mobile.

Ưu tiên:
- Layout không tràn ngang.
- Các nút có nhãn rõ ràng và vùng bấm phù hợp.
- Có thể thao tác bằng bàn phím.
- Form input có label.
- Focus state dễ nhìn.
- Màu chữ đủ tương phản.
- Tôn trọng prefers-reduced-motion nếu có animation.
- Loading và lỗi có thể nhận biết mà không chỉ dựa vào màu sắc.

Không thiết kế lại toàn bộ UI. Hãy chỉ ra vấn đề cụ thể từ các file/ảnh tôi cung cấp và sửa theo từng phần.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích các trạng thái UX loading, empty, success và error; khi nào nên dùng spinner, skeleton hoặc progress indicator; và các nguyên tắc accessibility cơ bản cần biết khi xây dựng ứng dụng React.
```

------------------------------------------------------------------------

# Ngày 7 --- Lịch sử báo cáo và lưu dữ liệu

## Prompt 1 --- Lưu lịch sử bằng IndexedDB

``` text
Hãy triển khai Report History cho AI Report Builder hiện tại.

Mỗi báo cáo cần lưu:
- ID.
- Tiêu đề.
- Markdown hiện tại.
- Bản Markdown gốc từ AI nếu có.
- Tên và loại file nguồn, không bắt buộc lưu bản sao file gốc.
- Loại template.
- createdAt và updatedAt.

Yêu cầu:
- Dùng IndexedDB, có thể dùng Dexie.js nếu phù hợp.
- Trang History liệt kê báo cáo, tìm kiếm theo tên và mở lại để sửa.
- Xóa báo cáo có confirmation.
- Giới hạn mặc định 50 báo cáo gần nhất.
- Xử lý lỗi khi trình duyệt không cho phép lưu dữ liệu.
- Không lưu API key hoặc dữ liệu bí mật.
- Không lưu đối tượng File trực tiếp vào localStorage.
- Giữ các trang và kiểu dữ liệu đang có; không tạo store/database thứ hai nếu đã có.

Trước tiên hãy xem các file state/store hiện tại tôi gửi và đề xuất thay đổi tối thiểu. Sau đó đưa code từng file.
```

## Prompt 2 --- Đồng bộ state

``` text
Hãy rà soát state hiện tại của files, report editor và history. Đề xuất cách đơn giản nhất để tránh dữ liệu bị lệch giữa các component.

Nếu thực sự cần Zustand, hãy dùng các store nhỏ với action rõ ràng. Không lưu dữ liệu có thể tính lại nếu không cần thiết. Dữ liệu bền vững phải được lưu qua lớp IndexedDB thích hợp; Zustand chỉ quản lý state giao diện và state đang hoạt động.

Không refactor toàn bộ project nếu useState/context hiện tại vẫn đáp ứng được. Hãy giải thích trade-off trước, rồi sửa từng file liên quan.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích sự khác nhau giữa React state, Zustand, localStorage và IndexedDB. Khi nào nên dùng từng loại trong ứng dụng có file upload, editor và lịch sử báo cáo? Nêu ví dụ cụ thể và các lỗi thường gặp khi refresh trang.
```

------------------------------------------------------------------------

# Ngày 8 --- Tối ưu và nâng chất lượng báo cáo

## Prompt 1 --- Giới hạn đầu vào và tiết kiệm quota

``` text
Hãy kiểm tra luồng parse file và generate report hiện tại để giảm lỗi với tài liệu lớn và tránh sử dụng quota AI không cần thiết.

Yêu cầu:
- Đặt giới hạn đầu vào có thể cấu hình.
- Đếm/ước lượng kích thước nội dung trước khi gửi AI.
- Nếu tài liệu quá dài, cho người dùng chọn nội dung/section cần xử lý hoặc dùng chế độ xử lý từng phần.
- Không tự gọi AI nhiều lần chỉ để phân tích loại tài liệu rồi mới tạo báo cáo, trừ khi thực sự cần.
- Nếu phải chunk, xử lý tuần tự và đặt giới hạn số request.
- Cho phép hủy request khi provider hỗ trợ.
- Không retry vô hạn khi hết quota.
- Local parsing, editor, history và PDF vẫn hoạt động khi AI không khả dụng.

Trước khi thay đổi, hãy giải thích luồng hiện tại dựa trên file tôi cung cấp. Chỉ sửa phần gây vấn đề và đề xuất test cho tài liệu nhỏ, tài liệu quá dài và lỗi 429.
```

## Prompt 2 --- Cải thiện báo cáo nhưng tránh gọi AI ngầm

``` text
Hãy cải thiện trải nghiệm tạo báo cáo mà không tăng số lần gọi AI ngoài ý muốn.

Chỉ thêm các chức năng sau nếu luồng MVP đang ổn:
- Người dùng nhập mục đích báo cáo, độc giả và độ dài mong muốn.
- Chọn tone: Formal, Technical, Simple hoặc Executive.
- Chọn một section rồi bấm Regenerate section.
- Chọn đoạn văn rồi bấm Improve.
- Giữ nguyên ngôn ngữ nguồn hoặc cho người dùng chọn ngôn ngữ đầu ra.

Mỗi thao tác AI phải do người dùng chủ động kích hoạt và hiển thị trạng thái đang xử lý. Không tự gọi AI khi gõ văn bản, chuyển tab hoặc mở lại báo cáo. Giữ bản hiện tại để người dùng có thể khôi phục.

Hãy triển khai từng tính năng một, không làm tất cả trong một lần. Trước mỗi tính năng, nêu file cần sửa và cách kiểm thử.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích context window, giới hạn token, chunking và vì sao chia tài liệu thành nhiều phần có thể làm tăng số request AI. Khi nào nên yêu cầu người dùng chọn phần nội dung thay vì tự động xử lý cả tài liệu? Dùng ví dụ thực tế.
```

------------------------------------------------------------------------

# Ngày 9 --- Tính năng nâng cao có chọn lọc

> Ngày này là ngày dự phòng. Chỉ làm khi luồng upload → parse → generate
> → edit → history → PDF đã ổn định. Không cố hoàn thành mọi tính năng
> dưới đây trong một ngày.

## Prompt 1 --- Hỗ trợ nhiều file trong một báo cáo

``` text
Hãy mở rộng tính năng tạo báo cáo từ nhiều file trong project hiện tại theo cách tiết kiệm quota.

MVP:
- Cho phép chọn nhiều file đã parse.
- Hiển thị tên file và thứ tự.
- Cho phép bỏ file khỏi nhóm.
- Gộp text cục bộ thành một nội dung có phân tách rõ tên từng file.
- Gửi một request AI nếu tổng nội dung nằm trong giới hạn đã cấu hình.
- Nếu quá dài, thông báo và cho người dùng chọn bớt file/section; không tự động tạo nhiều request không giới hạn.
- Trong báo cáo, phân biệt nguồn thông tin theo từng file và không bịa dữ kiện.

Chưa làm chế độ compare phức tạp, trọng số file hoặc sequential multi-stage generation. Kiểm tra giới hạn input trước khi gọi API.
```

## Prompt 2 --- Bổ sung export và in

``` text
Hãy kiểm tra chức năng PDF hiện tại rồi bổ sung những tính năng export đơn giản nhất nếu chúng chưa có:
- Download Markdown (.md).
- Copy Markdown vào clipboard.
- Print-friendly view bằng CSS nếu phù hợp.
- Có thể thêm DOCX chỉ khi giải pháp thư viện phù hợp và không làm ảnh hưởng PDF hiện tại.

Không tạo share link giả bằng cách chỉ lưu dữ liệu trong localStorage. Nếu chưa có backend/database, hãy ghi rõ rằng chia sẻ giữa thiết bị chưa được hỗ trợ. Chưa cần batch ZIP export.

Hãy chỉ sửa file liên quan, đưa code đầy đủ và hướng dẫn test từng chức năng.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích sự khác nhau giữa gộp nhiều file trước khi gửi AI, so sánh tài liệu bằng AI và RAG. Giải thích vì sao link trỏ đến localStorage không thể tự chia sẻ báo cáo cho người dùng khác hoặc thiết bị khác.
```

------------------------------------------------------------------------

# Ngày 10 --- Kiểm thử, sửa lỗi và triển khai

## Prompt 1 --- Kiểm tra toàn bộ luồng

``` text
Tôi sẽ cung cấp cấu trúc project, package.json, các file quan trọng và kết quả chạy lệnh. Hãy giúp tôi lập checklist kiểm thử cho AI Report Builder.

Các luồng bắt buộc:
1. Upload từng định dạng .txt, .md, .docx, .pptx.
2. Từ chối file sai định dạng, file rỗng và file vượt giới hạn.
3. Parse text và hiển thị nội dung.
4. Tạo báo cáo thành công bằng AI API đã cấu hình.
5. Xử lý API key sai, lỗi mạng, response rỗng và HTTP 429.
6. Hủy generation nếu hỗ trợ.
7. Edit, preview và khôi phục bản AI gốc.
8. Lưu báo cáo, refresh trang, mở lại và xóa báo cáo.
9. Export PDF có tiếng Việt.
10. Kiểm tra layout desktop/mobile.

Hãy đưa checklist theo thứ tự, các lệnh tôi cần chạy và kết quả mong đợi. Nếu tìm thấy lỗi, xử lý từng lỗi một dựa trên file và log thực tế. Không tuyên bố test đã pass nếu tôi chưa cung cấp kết quả.
```

## Prompt 2 --- Production setup

``` text
Hãy hướng dẫn tôi chuẩn bị AI Report Builder để deploy lên Vercel.

Yêu cầu:
- Kiểm tra package.json, scripts, route handlers và cấu hình hiện tại mà tôi cung cấp.
- Cấu hình GEMINI_API_KEY và GEMINI_MODEL trong Environment Variables trên hosting.
- Không đưa API key thật vào Git, client code, log hoặc ảnh chụp.
- Cập nhật .env.example bằng placeholder.
- Xác minh model đang cấu hình có thể dùng với tài khoản và free-tier hiện tại bằng tài liệu chính thức.
- Kiểm tra giới hạn thời gian chạy, streaming và dung lượng request theo plan hosting đang dùng; không giả định mọi tính năng đều được miễn phí.
- Thêm rate limiting phù hợp nếu có thể triển khai đúng trên môi trường serverless; không dựa vào biến toàn cục in-memory như giải pháp giới hạn request đáng tin cậy giữa nhiều instance.
- Đảm bảo không tự chuyển sang API/model trả phí khi hết quota.
- Đưa checklist build, deploy và smoke test sau deploy.

Hãy hướng dẫn từng bước và chờ tôi gửi kết quả sau mỗi giai đoạn. Không khẳng định đã deploy thành công khi tôi chưa thực hiện.
```

## Prompt 3 --- Học kiến thức

``` text
Giải thích unit test, integration test và E2E test; cách mock AI API để không tiêu tốn quota; environment variables; serverless function; streaming timeout; rate limiting và CI/CD. Dùng ví dụ của AI Report Builder và đề xuất thứ tự học phù hợp cho người mới.
```

------------------------------------------------------------------------

## 3. Tổng quan tiến độ

  Ngày   Kết quả cần đạt                                    Ưu tiên
  ------ -------------------------------------------------- -----------------------------
  1      Project chạy được, layout và cấu hình AI an toàn   Bắt buộc
  2      Upload và trích xuất text từ 4 định dạng           Bắt buộc
  3      Gọi AI và tạo báo cáo bản đầu                      Bắt buộc
  4      Prompt templates, Markdown editor và preview       Bắt buộc
  5      Export PDF có tiếng Việt                           Bắt buộc
  6      Loading, lỗi và responsive cơ bản                  Bắt buộc
  7      Lưu/mở/xóa lịch sử báo cáo                         Bắt buộc
  8      Giới hạn input, hủy request và tối ưu quota        Quan trọng
  9      Multi-file và export bổ sung nếu còn thời gian     Tùy chọn
  10     Kiểm thử, sửa lỗi và deploy                        Bắt buộc nếu muốn phát hành

------------------------------------------------------------------------

## 4. Tech stack đề xuất

-   **Framework:** Next.js App Router + TypeScript.
-   **UI:** Tailwind CSS + shadcn/ui.
-   **AI:** Google Gemini API qua `@google/genai`, chỉ cấu hình model có
    free tier khả dụng.
-   **AI config:** `GEMINI_API_KEY`, `GEMINI_MODEL`.
-   **File parsing:** Mammoth cho DOCX; thư viện đọc ZIP/XML phù hợp cho
    PPTX; xử lý TXT/MD trực tiếp.
-   **Editor:** Markdown + `react-markdown` + `remark-gfm`.
-   **State:** React state hoặc Zustand khi thực sự cần; không refactor
    quá sớm.
-   **History:** IndexedDB, có thể dùng Dexie.js.
-   **PDF:** Chọn một giải pháp sau khi kiểm tra yêu cầu font tiếng Việt
    và hosting.
-   **Testing:** Vitest; Playwright cho luồng E2E khi MVP đã ổn.
-   **Deploy:** Vercel hoặc hosting phù hợp với giới hạn API/streaming
    thực tế.

### Ghi chú về AI miễn phí

-   Gói miễn phí có hạn mức và chính sách có thể thay đổi; không đảm bảo
    sử dụng vô hạn.
-   Ứng dụng không tự reset quota và không được giả định thời gian reset
    theo giờ Việt Nam. Hãy xử lý theo chính sách hiện hành của nhà cung
    cấp.
-   Khi hết quota, người dùng vẫn phải xem/sửa báo cáo cũ, xem lịch sử
    và xuất PDF được.
-   Không tự động chuyển sang model/API trả phí.
-   Kiểm tra tài liệu chính thức trước khi chọn model và trước khi
    deploy.

Tham khảo: - Gemini API rate limits:
https://ai.google.dev/gemini-api/docs/rate-limits - Google AI Studio:
https://aistudio.google.com/

------------------------------------------------------------------------

## 5. Definition of Done --- Khi nào một ngày được xem là hoàn thành?

Một ngày chỉ được đánh dấu hoàn thành khi: - \[ \] Tôi đã áp dụng code
vào project. - \[ \] Tôi đã chạy các lệnh kiểm tra phù hợp. - \[ \] Tôi
đã thử chức năng trên trình duyệt hoặc test tự động. - \[ \] Không còn
lỗi nghiêm trọng chưa hiểu rõ. - \[ \] Tôi đã lưu lại file nào được
tạo/sửa và trạng thái hiện tại. - \[ \] Tôi có thể giải thích ngắn gọn
chức năng vừa làm.

**Nguyên tắc quan trọng nhất:** dùng ChatGPT như một người hướng dẫn và
hỗ trợ viết code theo từng thay đổi nhỏ, không phải như một agent có thể
tự hiểu, tự sửa và tự kiểm thử toàn bộ repository. Tốc độ chậm hơn một
chút nhưng dễ kiểm soát, dễ tìm lỗi và phù hợp hơn khi bạn tự áp dụng
code trong IDE.
