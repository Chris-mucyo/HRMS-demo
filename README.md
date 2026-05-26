# 🏢 Human Resource Management System (HRMS)

A comprehensive, full-stack Human Resource Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Tailwind CSS.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- Password reset via email
- JWT-based authentication
- Role-Based Access Control (Admin, HR Manager, Employee)

### 👥 Employee Management
- Complete CRUD operations
- Profile picture upload
- Advanced search and filtering
- Pagination support
- Department assignment

### 🏢 Department Management
- Create, update, and delete departments
- Assign employees to departments
- Budget tracking

### ⏰ Attendance Management
- Check-in and check-out
- Late arrival tracking
- Overtime calculation
- Attendance reports

### 📅 Leave Management
- Multiple leave types (Annual, Sick, Maternity, Emergency)
- Leave application workflow
- HR approval/rejection
- Leave balance tracking

### 💰 Payroll Management
- Automatic salary calculation
- Allowances and deductions
- Overtime and bonus management
- PDF payslip generation

### 📊 Performance Management
- Employee performance reviews
- Multi-criteria rating system
- Goal setting and tracking
- Performance reports

### 📈 Report Generation
- Employee, Attendance, Leave, Payroll, Performance reports
- PDF download
- Date range filtering

## 🛠 Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- PDFKit for PDF generation
- Nodemailer for emails

### Frontend
- React.js 18
- React Router DOM v6
- Tailwind CSS
- Heroicons
- Recharts for charts
- Axios for API calls

## 📁 Project Structure

```text
HRMS/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   ├── performanceController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Payroll.js
│   │   └── Performance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── departments.js
│   │   ├── attendance.js
│   │   ├── leaves.js
│   │   ├── payroll.js
│   │   ├── performance.js
│   │   └── reports.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── uploads/
│   │   └── profiles/
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── DepartmentList.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── LeaveManagement.jsx
│   │   │   ├── Payroll.jsx
│   │   │   ├── Performance.jsx
│   │   │   └── Reports.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.0 or higher)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hrms.git
cd hrms
```

### 2. Backend Setup

```bash
cd backend
npm install
mkdir -p uploads/profiles
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FROM_NAME=HRMS System
FROM_EMAIL=noreply@hrms.com
FRONTEND_URL=http://localhost:3000
```

## 🌱 Database Seeding

```bash
cd backend
npm run seed
```

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | Admin@123 |
| HR Manager | hr@hrms.com | Admin@123 |
| Employee | james.wilson@hrms.com | Password@123 |

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

### Start Frontend Application

```bash
cd frontend
npm start
```

App runs on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:token` - Reset password

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee
- `POST /api/employees` - Create employee (Admin, HR)
- `PUT /api/employees/:id` - Update employee (Admin, HR)
- `DELETE /api/employees/:id` - Delete employee (Admin)

### Departments

- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (Admin, HR)
- `PUT /api/departments/:id` - Update department (Admin, HR)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Attendance

- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-attendance` - My attendance
- `GET /api/attendance` - All attendance (Admin, HR)

### Leaves

- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/my-leaves` - My leaves
- `GET /api/leaves` - All leaves (Admin, HR)
- `PUT /api/leaves/:id/approve` - Approve leave (Admin, HR)
- `PUT /api/leaves/:id/reject` - Reject leave (Admin, HR)

### Payroll

- `POST /api/payroll` - Generate payroll (Admin, HR)
- `GET /api/payroll` - All payrolls (Admin, HR)
- `GET /api/payroll/my-payroll` - My payrolls
- `GET /api/payroll/payslip/:id` - Download payslip

### Performance

- `POST /api/performance` - Create review (Admin, HR)
- `GET /api/performance` - All reviews (Admin, HR)
- `GET /api/performance/my-reviews` - My reviews

### Reports

- `GET /api/reports/employees` - Employee report (Admin, HR)
- `GET /api/reports/attendance` - Attendance report (Admin, HR)
- `GET /api/reports/leaves` - Leave report (Admin, HR)
- `GET /api/reports/payroll` - Payroll report (Admin, HR)
- `GET /api/reports/performance` - Performance report (Admin, HR)

## 👥 User Roles

### Admin

- Full system access
- Manage all employees and departments
- Delete records
- View all reports

### HR Manager

- Manage employees (CRUD)
- Manage departments
- Approve/reject leaves
- Manage payroll
- Create performance reviews

### Employee

- View own profile
- Check in/check out
- Apply for leave
- View payroll and payslips
- View performance reviews

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

Your Name - [@Chris-mucyo](https://github.com/Chris-mucyo)

Project Link: [https://github.com/Chris-mucyo/hrms](https://github.com/Chris-mucyo/hrms)

## 🙏 Acknowledgments

- Express.js
- MongoDB
- React.js
- Tailwind CSS
- Heroicons
- Recharts
- PDFKit

---

⭐ If you find this project helpful, please give it a star!
