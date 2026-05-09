# 🚂 TrainTickets - Hệ Thống Bán Vé Tàu Hỏa

<div align="center">

[![Status](https://img.shields.io/badge/status-in%20development-yellow?style=flat-square)](https://github.com/tienchinh21/traintickets)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![API](https://img.shields.io/badge/API-RESTful-green?style=flat-square)](https://github.com/tienchinh21/traintickets/tree/main/api)
[![Tech Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20MongoDB-orange?style=flat-square)](https://github.com/tienchinh21/traintickets)

**Một hệ thống bán vé tàu hỏa cận production, được xây dựng từ đầu với mục tiêu học tập và nâng cao kinh nghiệm phát triển phần mềm.**

[🌐 Demo](#) • [📚 API Docs](#) • [🚀 Getting Started](#getting-started) • [📋 Roadmap](#roadmap)

</div>

---

## 📖 Giới Thiệu

**TrainTickets** là dự án cá nhân được phát triển với mục tiêu xây dựng một hệ thống bán vé tàu hỏa hoàn chỉnh, từ backend API đến frontend. Dự án này được thiết kế để mô phỏng các hệ thống thực tế, giúp tôi học hỏi và áp dụng các best practices trong phát triển phần mềm.

> 💡 **Mục tiêu:** Xây dựng một hệ thống scalable, maintainable và production-ready để nâng cao kỹ năng fullstack development.

## ✨ Tính Năng Chính

### 🎯 Core Features
- 🔐 **Xác thực & Phân quyền** - JWT-based authentication với role-based access control
- 🎫 **Đặt vé tàu** - Tìm kiếm và đặt vé với real-time availability checking
- 📅 **Quản lý lịch trình** - Xem và quản lý thởi gian biểu tàu chạy
- 💺 **Chọn chỗ ngồi** - Interactive seat selection với visualization
- 💳 **Thanh toán** - Tích hợp cổng thanh toán (đang phát triển)
- 📧 **Thông báo** - Email/SMS notifications cho booking confirmations

### 🛠️ Technical Features
- 🔄 **RESTful API** - Well-designed API endpoints với proper HTTP methods
- 📊 **Database Design** - Optimized MongoDB schema với proper indexing
- 🧪 **Testing** - Unit tests và integration tests coverage
- 📖 **API Documentation** - Swagger/OpenAPI documentation
- 🐳 **Containerization** - Docker support cho easy deployment
- 🚀 **CI/CD** - Automated testing và deployment pipeline

## 🏗️ Kiến Trúc Hệ Thống

```
TrainTickets/
├── 📁 api/                    # Backend API Service
│   ├── 📁 src/
│   │   ├── 📁 config/         # Configuration & Environment
│   │   ├── 📁 controllers/    # Request handlers
│   │   ├── 📁 models/         # Database models
│   │   ├── 📁 routes/         # API routes
│   │   ├── 📁 middleware/     # Custom middleware
│   │   ├── 📁 services/       # Business logic
│   │   ├── 📁 utils/          # Utility functions
│   │   └── 📁 tests/          # Test suites
│   ├── 📄 package.json
│   └── 📄 server.js
│
├── 📁 client/                 # Frontend Application (Coming Soon)
├── 📁 docs/                   # Documentation
├── 📁 docker/                 # Docker configurations
└── 📄 README.md
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (v6.0+)
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/tienchinh21/traintickets.git
   cd traintickets
   ```

2. **Cài đặt dependencies cho API**
   ```bash
   cd api
   npm install
   ```

3. **Cấu hình environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file với cấu hình của bạn
   ```

4. **Khởi động server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Truy cập API**
   - API Server: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`

## 📚 API Endpoints

### Authentication
```
POST   /api/v1/auth/register     # Đăng ký tài khoản
POST   /api/v1/auth/login        # Đăng nhập
POST   /api/v1/auth/refresh      # Refresh token
DELETE /api/v1/auth/logout       # Đăng xuất
```

### Trains & Schedules
```
GET    /api/v1/trains            # Danh sách tàu
GET    /api/v1/trains/:id        # Chi tiết tàu
GET    /api/v1/schedules         # Lịch trình tàu chạy
GET    /api/v1/schedules/search  # Tìm kiếm chuyến tàu
```

### Bookings
```
POST   /api/v1/bookings          # Tạo booking mới
GET    /api/v1/bookings          # Danh sách booking
GET    /api/v1/bookings/:id      # Chi tiết booking
PUT    /api/v1/bookings/:id      # Cập nhật booking
DELETE /api/v1/bookings/:id      # Hủy booking
```

> 📖 Xem chi tiết API documentation tại `/api-docs` sau khi khởi động server.

## 🛠️ Tech Stack

### Backend (API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB với Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi / express-validator
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI
- **Logging:** Winston
- **Security:** Helmet, CORS, Rate Limiting

### DevOps & Tools
- **Version Control:** Git
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint, Prettier
- **API Testing:** Postman / Insomnia

## 🗺️ Roadmap

### Phase 1: API Development ✅ (Current)
- [x] Project setup và cấu trúc thư mục
- [x] Database design và models
- [x] Authentication system
- [x] CRUD operations cho trains và schedules
- [ ] Booking system với seat management
- [ ] Payment integration
- [ ] Email notifications
- [ ] API documentation hoàn chỉnh
- [ ] Unit và integration tests

### Phase 2: Frontend Development 🔄 (Upcoming)
- [ ] React/Vue.js frontend setup
- [ ] User interface design
- [ ] Admin dashboard
- [ ] Real-time updates với WebSocket

### Phase 3: Production Ready 🚀 (Future)
- [ ] Performance optimization
- [ ] Caching layer (Redis)
- [ ] Monitoring và logging
- [ ] Load balancing
- [ ] Microservices architecture

## 🤝 Contributing

Dự án này được phát triển cho mục đích học tập, nhưng mọi đóng góp đều được hoan nghênh!

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án được phân phối dưới giấy phép MIT. Xem [LICENSE](LICENSE) để biết thêm chi tiết.

## 👤 Tác Giả

**Tiến Chính**

- GitHub: [@tienchinh21](https://github.com/tienchinh21)
- LinkedIn: [Tiến Chính](#)
- Email: [your-email@example.com](mailto:your-email@example.com)

---

<div align="center">

⭐ **Star repo này nếu bạn thấy hữu ích!** ⭐

*Được xây dựng với ❤️ và ☕ để học tập và phát triển*

</div>
