import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProviderWait } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
// Pages
import { Dashboard } from './pages/Dashboard';
import { Employees as EmployeeList } from './pages/Employees';
import { EmployeeForm } from './pages/EmployeeForm';
import { Login } from './pages/Login';
import { Departments } from './pages/Departments';
import { LeavePolicies } from './pages/admin/LeavePolicies';
import { Holidays } from './pages/admin/Holidays';
import SalaryStructure from './pages/admin/SalaryStructure';
import PayrollDashboard from './pages/admin/PayrollDashboard';
import Reports from './pages/admin/Reports';
import MyPayslips from './pages/MyPayslips';
import Attendance from './pages/Attendance';
import MyLeaves from './pages/MyLeaves';

import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProviderWait>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Common */}
              <Route path="/" element={<Dashboard />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id" element={<EmployeeForm />} />
              <Route path="/admin/employees" element={<EmployeeList />} />

              <Route path="/departments" element={<Departments />} />

              <Route path="/admin/policies" element={<LeavePolicies />} />
              <Route path="/admin/holidays" element={<Holidays />} />
              <Route path="/admin/salary-structure" element={<SalaryStructure />} />
              <Route path="/admin/payroll" element={<PayrollDashboard />} />
              <Route path="/admin/reports" element={<Reports />} />

              {/* Attendance Module */}
              <Route path="/attendance" element={<Attendance />} />

              {/* Employee Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaves" element={<MyLeaves />} />
              <Route path="/my-leaves" element={<MyLeaves />} />
              <Route path="/my-payslips" element={<MyPayslips />} />
              <Route path="/reports" element={<Reports />} />

              {/* Fallback */}
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProviderWait>
    </Router>
  );
}

export default App;
