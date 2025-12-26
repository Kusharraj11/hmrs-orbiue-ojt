# 🧪 Comprehensive Step-by-Step Testing Guide & Code Walkthrough

This guide provides a detailed sequence to verify every feature of the HRMS, paired with an explanation of the underlying code logic for each step.

---

## 🔐 1. Authentication & Role-Based Access

### **Test Steps**
1.  **Open**: `http://localhost:5173/login`
2.  **Action**: Login as Admin (`admin@company.com` / `admin123`).
3.  **Verify**: You are redirected to `/admin/dashboard`.
4.  **Action**: Logout and login as Employee (`emp@company.com` / `employee123`).
5.  **Verify**: You are redirected to `/dashboard` (Employee Dashboard), and Admin links are hidden in the sidebar.

### **💻 Code Explanation**
*   **Frontend**: `Login.tsx` calls `authApi.login()`. On success, it stores the JWT token in `localStorage`.
*   **Routing**: `App.tsx` uses `ProtectedRoute`. It checks `user.role`. If a user tries to access `/admin/*` without the `ADMIN` or `HR` role, they are redirected.
*   **Backend**: `auth.controller.ts` verifies credentials with `bcrypt`. It generates a JWT containing `{ userId, role }`.

---

## 👥 2. Employee Management (Admin/HR)

### **Test Steps**
1.  **Login**: As Admin/HR.
2.  **Navigate**: Click **"Employees"** in the sidebar.
3.  **Action**: Click **"Add New Employee"**.
4.  **Input**: Fill details (Name: `Test User`, Email: `test@test.com`, Dept: `IT`, Salary: `50000`). Click **Submit**.
5.  **Verify**: Toast appears "Employee Created". Redirects to list. New employee appears in the table.

### **💻 Code Explanation**
*   **Frontend**: `EmployeeForm.tsx` collects data and POSTs to `/api/employees`.
*   **Backend**: `employee.controller.ts` receives the request.
    *   It uses `Prisma` to create an `Employee` record.
    *   It *automatically* creates a linked `User` account (default password `password123`) so this new employee can login immediately.
    *   It initializes a `LeaveBalance` record for them (set to 0 by default).

---

## 📅 3. Attendance System (Employee)

### **Test Steps**
1.  **Login**: As Employee (`emp@company.com`).
2.  **Navigate**: Click **"Attendance"**.
3.  **Action**: Click the big **"Clock In"** button.
4.  **Verify**: Button changes to "Clock Out". "Today's Status" updates to **"PRESENT"**.
5.  **Action**: Wait 1 minute. Click **"Clock Out"**.
6.  **Verify**: Table below updates with today's date, Check-in/out times, and "Total Hours".

### **💻 Code Explanation**
*   **Frontend**: `Attendance.tsx` has a live clock. Clicking the button calls `attendanceApi.clockIn()`.
*   **Backend**: `attendance.service.ts`:
    *   `clockIn()` checks if a record exists for `today`. If not, creates one.
    *   `clockOut()` updates the `checkOut` time and calculates `totalHours` = `(checkOut - checkIn)`.
    *   Updates status: If hours < 4, marks `HALF_DAY` (logic configurable).

---

## 🏖️ 4. Leave Management (End-to-End)

### **Part A: Employee Apply**
1.  **Navigate**: Click **"My Leaves"**.
2.  **Action**: Input Start Date (Tomorrow), End Date (Day after), Reason ("Sick"). Click **Apply**.
3.  **Verify**: New row appears in "Leave History" with status **PENDING**.

### **Part B: HR Approve**
1.  **Login**: As HR (`hr@company.com`).
2.  **Navigate**: **Dashboard** (Home).
3.  **Action**: Locate the "Pending Leaves" widget/list. Click **Approve** on the request.
4.  **Verify**: Status changes to **APPROVED**.
5.  **Check**: Go back to Employee login -> "My Leaves". The Balance (e.g., Casual Leave) has decreased by 2 days.

### **💻 Code Explanation**
*   **Apply**: `leave.service.ts` creates a `LeaveRequest` with status `PENDING`.
*   **Approve**:
    *   Updates `LeaveRequest` status to `APPROVED`.
    *   **Crucial Logic**: `leave.service.ts` calculates the number of days excluding weekends. It then *decrements* the `LeaveBalance` table for that employee.

---

## 💰 5. Payroll Processing (Admin Only)

### **Test Steps**
1.  **Login**: As Admin.
2.  **Navigate**: **"Payroll"** (Salary Management).
3.  **Action**: Select Month (e.g., December 2025). Click **"Run Payroll"**.
4.  **Verify**:
    *   Processing spinner appears.
    *   Success message: "Payroll processed for X employees".
    *   Table populates with Net Pay figures.
    *   "Download PDF" button becomes active.

### **💻 Code Explanation**
*   **Service**: `payroll.service.ts` is the engine.
    1.  **Fetch**: Gets all active employees.
    2.  **Attendance Check**: Counts "Absent" days from the `Attendance` table for the selected month to calculate **Loss of Pay (LOP)**.
    3.  **Components**: Adds Basic + HRA + Allowances. Subtracts Tax + PF + LOP.
    4.  **Result**: `Net Pay` = Earnings - Deductions.
    5.  **PDF**: Calls `pdf.service.ts` (using `pdfkit`) to generate a file on the server.

---

## 📊 6. Reporting & Analytics (New Feature)

### **Test Steps**
1.  **Navigate**: **"Reports"** (`/admin/reports`).
2.  **Leave Liability**:
    *   View the table showing everyone's remaining leave balances.
    *   Click **"Export PDF"**. Verify a file `leave_liability.pdf` is downloaded.
3.  **Attendance Anomalies**:
    *   Click "Attendance Anomalies" tab.
    *   Select Dates. It shows employees who were "LATE" or worked short hours.

### **💻 Code Explanation**
*   **Repository**: `reporting.repository.ts` uses specialized Prisma queries (aggregates) to fetch summary data efficiently without loading all records.
*   **Export**: `reporting.service.ts` fetches this data and pipes it into a `PDFDocument` stream or converts JSON to CSV string.

---

## 🚀 Summary of Tech Stack
*   **Frontend**: React + Vite (Fast builds), CSS Modules (Scoped styling).
*   **Backend**: Node.js + Express (API).
*   **Database**: PostgreSQL + Prisma (Type-safe database queries).
*   **Gen-AI**: Code logic assisted by Google DeepMind's Antigravity Agent.
