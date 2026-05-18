# Anti-Fraud Investigation Case Tracking System

Sistem tracking dan manajemen investigasi kasus fraud dengan fitur email monitoring otomatis.

## 🚀 Features

- 🔐 Authentication & Role-Based Access Control (9 user roles)
- 📧 Auto Email Detection (Gmail IMAP Integration)
- 📊 Dashboard & Real-time Statistics
- 📝 Case Management (CRUD Operations)
- 📈 Reports & Data Visualization (Charts)
- 📥 Export to Excel & PDF
- 🔔 Real-time Notifications
- ⏰ SLA Tracking dengan Business Days Calculation
- 👥 Multi-role System (Investigator, Kepala Divisi, Direktur, dll)

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (Data Visualization)
- Axios (HTTP Client)
- React Hot Toast (Notifications)

**Backend:**
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT Authentication
- Nodemailer + IMAP (Email Integration)
- Moment.js (Date Handling)

## 📦 Installation (Local Development)

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Gmail App Password

### Setup

1. Clone repository
```bash
git clone <your-repo-url>
cd anti-fraud-system
```

2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi lokal
npm run dev
```

3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

4. Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 👥 Default Users

| Role | Email | Password |
|------|-------|----------|
| Investigator | investigator1@antifraud.com | investigator123 |
| Investigator | investigator2@antifraud.com | investigator123 |
| Investigator | investigator3@antifraud.com | investigator123 |
| Investigator | investigator4@antifraud.com | investigator123 |
| Kepala Divisi | kepala.divisi@antifraud.com | kepaladiv123 |
| Kepala Departemen | kepala.departemen@antifraud.com | kepaladept123 |
| Direktur | direktur@antifraud.com | direktur123 |
| Presiden Direktur | presdir@antifraud.com | presdir123 |
| Superuser | admin@antifraud.com | admin123 |

## 🚀 Deployment

Deployed on Railway.app with PostgreSQL database.

- **Backend API:** [Your Railway Backend URL]
- **Frontend:** [Your Railway Frontend URL]

## 📝 Environment Variables

### Backend (.env)

PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
EMAIL_USER=your-email
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=your-frontend-url

### Frontend (.env)

VITE_API_URL=your-backend-api-url

## 📄 License

Private - Internal Use Only

## 👨‍💻 Developer

Developed by Yosua Melvin