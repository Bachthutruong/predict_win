# PredictWin - Prediction Gaming Platform

PredictWin là một nền tảng game dự đoán hoàn chỉnh được xây dựng với Next.js 15, TypeScript, MongoDB và Tailwind CSS. Người dùng có thể tham gia dự đoán, kiếm điểm, và tương tác với cộng đồng.

## ✨ Tính năng chính

### 🔐 Hệ thống xác thực
- Đăng ký/đăng nhập với email và mật khẩu
- Xác minh email với token
- Phân quyền 3 cấp: Admin, Staff, User
- JWT authentication với cookies

### 🎯 Hệ thống dự đoán
- Admin tạo predictions với hình ảnh
- User trả điểm để tham gia dự đoán
- Người đoán đúng nhận 150% điểm
- Theo dõi và hiển thị kết quả

### 📅 Hệ thống check-in hàng ngày
- Câu hỏi hàng ngày để kiếm điểm
- Theo dõi streak liên tục
- Bonus điểm cho streak 7, 14, 30 ngày
- Câu hỏi có hình ảnh và độ ưu tiên

### 👥 Hệ thống referral
- Tạo mã giới thiệu unique
- Kiếm 100 điểm khi bạn bè check-in 3 ngày liên tục
- Bonus 500 điểm cho mỗi 10 referral thành công
- Theo dõi tiến trình milestone

### 💰 Quản lý điểm
- Lịch sử giao dịch chi tiết
- Admin có thể cấp/trừ điểm thủ công
- Tracking đầy đủ với lý do và ghi chú

### 💬 Hệ thống feedback
- User gửi feedback cải thiện hệ thống
- Admin duyệt và thưởng điểm
- Hiển thị feedback được duyệt cho cộng đồng

### 🎨 Giao diện
- UI hiện đại với shadcn/ui components
- Dark/Light mode support
- Responsive design cho mobile
- Loading states và error handling

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- MongoDB
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd predict_win
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local` với thông tin của bạn:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/predictwin

# Authentication  
JWT_SECRET=your-super-secret-jwt-key-here

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@predictwin.com

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

### 4. Khởi chạy MongoDB
Đảm bảo MongoDB đang chạy trên máy local hoặc sử dụng MongoDB Atlas.

### 5. Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🗂️ Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin pages
│   ├── (main)/            # Main user pages  
│   ├── actions.ts         # Server Actions
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utilities
│   ├── auth.ts          # Authentication
│   ├── mongodb.ts       # Database connection
│   └── utils.ts         # Helper functions
├── models/              # Mongoose models
├── types/               # TypeScript types
└── middleware.ts        # Next.js middleware
```

## 📱 Sử dụng

### Cho người dùng:
1. **Đăng ký tài khoản** tại `/register`
2. **Xác minh email** từ link trong email
3. **Check-in hàng ngày** tại `/check-in` để kiếm điểm
4. **Tham gia predictions** tại `/predictions`
5. **Chia sẻ mã referral** tại `/referrals`
6. **Gửi feedback** tại `/feedback`
7. **Xem profile và lịch sử** tại `/profile`

### Cho admin:
1. **Quản lý predictions** tại `/admin-predictions`
2. **Quản lý câu hỏi** tại `/questions`
3. **Cấp điểm cho users** tại `/grant-points`
4. **Duyệt feedback** tại `/admin-feedback`

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT, bcryptjs
- **Email**: Nodemailer
- **AI**: Google Genkit (optional)

## 🔐 Bảo mật

- JWT tokens với HTTP-only cookies
- Password hashing với bcryptjs
- Email verification bắt buộc
- Middleware bảo vệ routes
- Input validation và sanitization

## 📈 Performance

- Static generation cho SEO
- Server-side rendering cho dynamic content  
- Optimized images và assets
- Middleware caching
- Database indexing

## 🚀 Deployment

### Vercel (Recommended)
1. Push code lên GitHub
2. Connect repository với Vercel
3. Cấu hình environment variables
4. Deploy!

### Manual deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết chi tiết.

## 🆘 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**PredictWin** - Nơi dự đoán trở thành niềm vui! 🎯✨
