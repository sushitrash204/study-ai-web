# 🌐 Yukon - Web Platform

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Yukon Web** là giao diện người dùng hiện đại, mạnh mẽ dành cho hệ thống hỗ trợ học tập thông minh. Được xây dựng trên nền tảng **Next.js 15+**, ứng dụng mang lại trải nghiệm mượt mà, tốc độ cao và tối ưu cho cả học tập cá nhân lẫn làm việc nhóm.

---

## 🎨 Giao diện & Trải nghiệm

*   **Premium Design:** Giao diện được thiết kế với phong cách hiện đại, sử dụng Tailwind CSS v4.
*   **Aesthetics:** Màu sắc hài hòa, hiệu ứng chuyển cảnh mượt mà, hỗ trợ cả Desktop và Mobile.
*   **Responsive:** Hoạt động hoàn hảo trên mọi kích thước màn hình.
*   **Dark Mode Support:** (Planned) Tùy chọn giao diện tối giảm mỏi mắt.

---

## 🚀 Tính năng nổi bật

*   **Dashboard:** Tổng quan tiến độ học tập và các gợi ý môn học.
*   **Library:** Hệ thống quản lý môn học và bài giảng thông minh.
*   **Study Groups:** Tham gia hoặc tạo các nhóm học tập, thảo luận trực tuyến.
*   **AI Chat:** Trò chuyện với trợ lý ảo AI để giải bài tập và tóm tắt kiến thức.
*   **Notifications:** Nhận thông báo thời gian thực về các hoạt động trong nhóm và hệ thống.
*   **Profile & Settings:** Quản lý thông tin cá nhân và cài đặt ứng dụng.

---

## 💻 Công nghệ sử dụng

*   **Framework:** Next.js (App Router)
*   **State Management:** Zustand (Cực nhẹ và nhanh)
*   **Styling:** Tailwind CSS + Lucide React (Icons)
*   **API Client:** Axios với cơ chế Auto-refresh Token
*   **Real-time:** Socket.IO Client

---

## 🛠️ Cài đặt và Chạy thử

1. **Clone dự án:**
   ```bash
   git clone https://github.com/sushitrash204/study-ai-web.git
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

4. **Chạy ở chế độ Development:**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment
Hỗ trợ tốt nhất khi triển khai trên **Vercel**.

---
*Developed with ❤️ by [Sushitrash204](https://github.com/sushitrash204)*
