# 🏢 HR Management System (HRMS) - Project Presentation

## 🌟 Executive Summary
This **HR Management System (HRMS)** is a comprehensive, full-stack solution designed to digitize and streamline human resource operations. It features a robust **Role-Based Access Control (RBAC)** system serving **Admins, HR Managers, and Employees**. 

The system automates critical workflows including **Employee Onboarding, Leave Management, Attendance Tracking, Payroll Processing**, and **Data-Driven Reporting**, ensuring operational efficiency and compliance.

---

## 🚀 Key Features & Modules

### 1. 🔐 Role-Based Access Control (RBAC)
Secure authentication ensures users only access data relevant to their role.
*   **System Admin**: Full access to configuration and global settings.
*   **HR Manager**: Manages employees, payroll, leaves, and reports.
*   **Employee**: Self-service portal for attendance, payslips, and leave requests.

### 2. 👥 Employee Management (Core HR)
Centralized database for all employee records.
*   **Digital Onboarding**: Streamlined form to capture personal, professional, and bank details.
*   **Employee Directory**: Searchable list of all staff members.
*   **Profile Management**: View and update employee details.

### 3. 📅 Leave Management System (LMS)
Automated workflow for managing time off.
*   **Policy Configuration**: Define rules for Sick, Casual, and Earned leaves.
*   **Self-Service Application**: Employees apply for leave with dates and reasons.
*   **Approval Workflow**: Managers/HR can Approve or Reject requests.
*   **Balance Tracking**: Real-time view of remaining leave days.

### 4. ⏱️ Attendance & Time Tracking
Real-time tracking of employee work hours.
*   **Live Clock In/Out**: One-click action for employees to mark attendance.
*   **Daily Status**: Visual indicators for Present, Absent, or Late.
*   **Anomaly Detection**: Automated flagging of "Late Arrivals" or "Short Working Hours".

### 5. 💰 Payroll & Salary Slip Generation (SSG)
End-to-end payroll processing engine.
*   **Salary Structuring**: Flexible configuration of Earnings (Basic, HRA) and Deductions (Tax, PF).
*   **One-Click Payroll Run**: Automatically calculates salaries based on attendance (Loss of Pay) and structure.
*   **PDF Payslips**: Auto-generates professional PDF payslips for all employees.
*   **Download Portal**: Employees can view and download their monthly slips instantly.

### 6. 📊 Reporting & Analytics
Data-driven insights for management.
*   **HR Dashboard**: Real-time widgets for "Total Staff", "Present Today", and "Pending Leaves".
*   **Leave Liability Report**: Financial view of accrued leave balances per department.
*   **Compliance Exports**: Download reports in **CSV** or **PDF** format for auditing.

---

## ⚙️ Technical Architecture

This system is built using a modern, scalable **MERN-like** stack (using Postgres):

*   **Frontend**: `React.js` (Vite), `Tailwind CSS` (Styled Components), `Framer Motion` (Animations).
*   **Backend**: `Node.js`, `Express.js`.
*   **Database**: `PostgreSQL` managed via `Prisma ORM`.
*   **Services**: 
    *   `PDFKit`: For generating dynamic PDF documents.
    *   `JWT`: For secure, stateless authentication.
    *   `Zod`: For strict data validation.

---

## 🔄 User Workflows (How it Works)

### 📌 Scenario A: Monthly Payroll Run
1.  **HR Manager** logs in and navigates to **Payroll Dashboard**.
2.  Selects the Month/Year and clicks **"Run Payroll"**.
3.  **System Action**: 
    *   Fetches active employees.
    *   Calculates **Loss of Pay (LOP)** based on Attendance records.
    *   Computes Gross and Net Salary.
    *   Generates a **PDF Payslip** and stores it securely.
    *   Saves the transaction.
4.  **Result**: Status updates to "Completed".
5.  **Employee** logs in, goes to **"My Payslips"**, and downloads the new PDF.

### 📌 Scenario B: Applying for Leave
1.  **Employee** logs in and goes to **"My Leaves"**.
2.  Checks **Leave Balances** (e.g., "I have 5 Casual Leaves left").
3.  Fills out the form (Dates: Tomorrow, Reason: "Personal Work") and Submits.
4.  **System Action**: Creates a "PENDING" request.
5.  **HR/Manager** sees the request on their Dashboard and clicks **Approve**.
6.  **Result**: Leave status becomes "APPROVED", and balance is deducted.

---

### 7. 🎨 UI 2.0 Redesign (Modern Glassmorphism)
A complete visual overhaul featuring a modern **Glassmorphism** aesthetic.
*   **Global Theme**: Dark, blurred backgrounds with semi-transparent glass cards.
*   **Enhanced Readability**: High-contrast text and modern typography (Inter).
*   **Fluent Animations**: Smooth transitions using Framer Motion.
*   **Consistent Design**: Applied across Dashboard, Attendance, Payroll, and Reports.

---

## 🛠️ Setup & Installation
**(For Local Testing)**

1.  **Start Database**: Ensure PostgreSQL is running.
2.  **Start Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
3.  **Start Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4.  **Login Credentials**:
    *   **Admin/HR**: `admin@company.com` / `password123`
    *   **Employee**: `emp@company.com` / `password123`
