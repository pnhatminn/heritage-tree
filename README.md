# Cội Nguồn – bản demo giao diện

Bản demo chạy hoàn toàn trên trình duyệt, chưa có server. Dữ liệu là dữ liệu mẫu, mọi thay đổi chỉ lưu trên trình duyệt đang dùng (localStorage).

## Cách mở

Mở file `index.html` bằng Chrome, Edge, Safari hoặc Firefox (bấm đúp là được). Không cần cài gì, không cần mạng.

## Tài khoản dùng thử

| Email | Mật khẩu |
|---|---|
| khanhlinh@gmail.com | 123456 |

Tài khoản có sẵn 2 cây:
- **Họ Nguyễn – bên nội**: 15 người, 4 đời (Nguyễn Văn A … Nguyễn Văn S)
- **Họ Đỗ – bên ngoại**: 6 người, 3 đời

## Nên thử

1. Trang chủ: xem cây tự vẽ ở phần đầu, kéo xuống "Xem thử" để thấy cây mẫu.
2. Đăng nhập: thử nhập sai mật khẩu, rồi bấm "Điền tự động".
3. Cây gia phả của tôi: thẻ giỗ sắp tới (tính theo ngày hôm nay), lọc bên nội/ngoại, tạo cây mới.
4. Màn hình cây:
   - Bấm vào một người để mở khung chi tiết bên phải; đường huyết thống lên tới thủy tổ được tô đỏ.
   - Kéo để di chuyển, Ctrl + cuộn (hoặc chụm 2 ngón trên trackpad) để phóng to. Phím `+` `-` `0`.
   - Nút tròn dưới mỗi gia đình để thu gọn / mở nhánh.
   - Ô tìm kiếm (phím `/`), gõ không dấu cũng được: "nguyen van q".
   - Sửa thông tin, thêm con / vợ / chồng / cha mẹ, ngày âm ⇄ dương, ngày giỗ tự tính, tải ảnh đại diện.
5. Tạo một cây mới để xem màn hình "Cây trống".

Muốn trở lại dữ liệu ban đầu: bấm vào tên tài khoản (góc trên bên phải) → **Khôi phục dữ liệu mẫu**.

## Cấu trúc thư mục

```
index.html                 khung trang, nạp các file bên dưới
assets/css/styles.css      toàn bộ giao diện (màu, chữ theo design system Heritage Editorial)
assets/fonts/              Noto Serif + Be Vietnam Pro (đóng gói sẵn, có tiếng Việt)
assets/js/lunar.js         âm lịch Việt Nam (thuật toán Hồ Ngọc Đức, múi giờ +7)
assets/js/util.js          icon, định dạng ngày, toast, modal
assets/js/data.js          dữ liệu mẫu (tài khoản, cây, người)
assets/js/store.js         đọc/ghi dữ liệu, đăng nhập, quan hệ gia đình
assets/js/layout.js        tính vị trí các thẻ trên cây
assets/js/tree-canvas.js   vẽ cây, kéo/phóng to, thu gọn nhánh
assets/js/app.js           điều hướng (#hash), đầu trang, chân trang
assets/js/views/           landing, auth (đăng nhập/đăng ký), trees (danh sách cây), tree (màn hình cây)
```
