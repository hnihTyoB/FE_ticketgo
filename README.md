# 🎫 TicketGo - Frontend (Client & Admin Dashboard)

TicketGo là giao diện người dùng chính thức cho nền tảng đặt vé sự kiện, bao gồm trang dành cho khách hàng (Client) và bảng điều khiển quản trị (Admin Dashboard).

🌍 **Production:** [https://fe-ticketgo.vercel.app/](https://fe-ticketgo.vercel.app/)

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: React 19, Vite
- **Styling & UI**: Tailwind CSS v4, Shadcn UI, Radix UI, Emotion
- **State Management & Data Fetching**: Axios
- **Form & Validation**: React Hook Form, Zod, Hookform Resolvers
- **Routing**: React Router DOM
- **Khác**: Recharts (Vẽ biểu đồ), Lucide React & FontAwesome (Icons), Sonner (Toast notifications), Next Themes (Dark/Light mode).

## 🛠️ Tính Năng Nổi Bật

- **Trải nghiệm người dùng (UI/UX)**: Giao diện hiện đại, responsive, hỗ trợ Dark/Light mode.
- **Client Side**: Tìm kiếm sự kiện, xem chi tiết sự kiện, đặt vé, chọn ghế/chỗ, thanh toán qua VNPay, xem vé QR Code của tôi.
- **Admin Dashboard**: Quản lý sự kiện, thống kê doanh thu với Recharts, quản lý người dùng, duyệt/hủy vé.
- **Bảo mật**: Xác thực bằng Cookie/Session (Credentials) khi gọi API, bảo vệ các Routes kín (Protected Routes).

---

## 💻 Hướng Dẫn Cài Đặt (Local Setup)

### 1. Yêu cầu hệ thống
- Node.js (v18 trở lên)
- Trình quản lý package: `npm`

### 2. Cài đặt các thư viện
```bash
cd frontend_ticketgo
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc (hoặc copy từ `.env.example`) và trỏ URL về backend của bạn:
```env
VITE_API_BASE_URL=http://localhost:9092
```

### 4. Khởi chạy dự án
Chạy ở môi trường phát triển (Development):
```bash
npm run dev
```

Build dự án ra môi trường Production:
```bash
npm run build
```
