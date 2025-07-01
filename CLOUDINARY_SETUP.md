# Cloudinary Setup Instructions

## Your Cloudinary Configuration
- **Cloud Name**: `dycxmy3tq`
- **API Key**: `728763913524778`
- **API Secret**: `S6hvz7VYYQ81LFkctZacoWXer7E` (⚠️ Keep this secret, don't use in frontend)

## 1. Create Upload Preset (IMPORTANT)
1. Đăng nhập vào [cloudinary.com](https://cloudinary.com) với tài khoản của bạn
2. Vào **Settings** → **Upload** → **Upload presets**
3. Click **Add upload preset**
4. Cấu hình như sau:
   - **Preset name**: `predict-win-preset` 
   - **Signing Mode**: **Unsigned** (Quan trọng!)
   - **Use filename or externally defined Public ID**: ✓ Checked
   - **Folder**: `predict-win` (tùy chọn, để tổ chức ảnh)
   - **Allowed formats**: `jpg,jpeg,png,gif,webp`
   - **Transformation**: 
     - **Quality**: `auto`
     - **Format**: `auto`
     - **Max dimensions**: `1920x1080` (tùy chọn)
5. **Save** preset

## 2. Environment Variables
Tạo file `.env.local` trong thư mục gốc của project:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dycxmy3tq
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=predict-win-preset

# Existing variables...
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
EMAIL_FROM=your_email_here
EMAIL_HOST=your_smtp_host_here
EMAIL_PORT=587
EMAIL_USER=your_email_user_here
EMAIL_PASSWORD=your_email_password_here
```

## 3. Test Upload
1. Restart server: `npm run dev`
2. Vào trang admin (Questions hoặc Predictions)
3. Thử upload ảnh để kiểm tra

## ⚠️ Lưu ý Bảo mật:
- **API_SECRET** chỉ dùng cho backend, không bao giờ để lộ ra frontend
- Sử dụng **Upload Preset unsigned** cho frontend
- Tất cả upload sẽ qua preset này với các quy tắc đã cấu hình

## Features Implemented

### ✅ Admin Pages Added:
- **Staff Management** (`/staff`): Create, edit, delete staff accounts
- **User Management** (`/users`): View, edit, delete user accounts with search and filtering

### ✅ Image Upload Integration:
- **Questions**: Upload images for questions instead of URL input
- **Predictions**: Upload images for predictions instead of URL input
- **Staff/User Management**: Upload avatar images during creation/editing

### ✅ Navigation Updated:
- Added "Quản lý nhân viên" (Staff Management) to admin menu
- Added "Quản lý người dùng" (User Management) to admin menu

## New Admin Actions Available:
- `getStaffUsers()`: Get all staff accounts
- `createStaffAction()`: Create new staff account
- `updateStaffAction()`: Update staff account
- `deleteStaffAction()`: Delete staff account
- `getAllUsers()`: Get all user accounts
- `updateUserAction()`: Update user account
- `deleteUserAction()`: Delete user account (with related data cleanup)

## Security Notes:
- Only admin users can access staff and user management pages
- Image uploads are restricted to common image formats (JPG, PNG, GIF, WebP)
- Maximum file size is set to 5MB
- All images are uploaded to a dedicated folder for organization 