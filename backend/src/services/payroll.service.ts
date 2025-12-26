import { PayrollRepository } from '../repositories/payroll.repository';
import { SalaryRepository } from '../repositories/salary.repository';
import { PdfService } from './pdf.service';
import prisma from '../config/prisma';
import { AttendanceStatus } from '@prisma/client';

const payrollRepo = new PayrollRepository();
const salaryRepo = new SalaryRepository();
const pdfService = new PdfService();

export class PayrollService {

    async runPayroll(month: number, year: number) {
        console.log(`Starting Payroll Run for ${month}/${year}`);

        // 1. Create Run Record
        const run = await payrollRepo.createRun(month, year);

        // 2. Fetch Active Employees
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' }
        });

        const results = [];

        // 3. Process Each Employee
        for (const emp of employees) {
            console.log(`Processing ${emp.firstName}...`);

            // A. Get Structure
            const structure = await salaryRepo.getEmployeeStructure(emp.id);
            if (structure.length === 0) {
                console.log(`Skipping ${emp.firstName}: No Salary Structure.`);
                continue;
            }

            // B. Calculate LOP (Loss of Pay)
            // LOP = Count of ABSENT records in the month
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of month

            const absentCount = await prisma.attendance.count({
                where: {
                    employeeId: emp.id,
                    date: { gte: startDate, lte: endDate },
                    status: AttendanceStatus.ABSENT // Or can check for missing days
                }
            });

            // C. Calculation
            let totalFixedGross = 0;
            const earnings = [];
            const deductions = [];

            // Identify Basic
            const basicComp = structure.find(s => s.component.name.toLowerCase().includes('basic'));
            const basicAmount = basicComp ? basicComp.amount : 0;
            totalFixedGross += basicAmount; // Add basic

            // First Pass: Fixed Components & Sum Gross
            for (const item of structure) {
                if (item.component.isFixed && item.component.type === 'EARNING') {
                    if (item.component.name.toLowerCase().includes('basic')) continue; // Already added
                    totalFixedGross += item.amount;
                }
            }

            // Calculate LOP Amount
            // Formula: (FixedGross / 30) * AbsentDays
            const perDaySalary = totalFixedGross / 30;
            const lopDeduction = perDaySalary * absentCount;

            // Populate Earnings List (Pro-rata)
            // For simplicity, we show Full Basic in details, and add LOP as a deduction line item.
            // OR we reduce Basic. Let's add LOP as deduction for clarity.

            let grossEarned = 0;
            for (const item of structure) {
                if (item.component.type === 'EARNING') {
                    let amt = item.amount;
                    if (!item.component.isFixed && item.component.percentage && basicAmount > 0) {
                        amt = (basicAmount * item.component.percentage) / 100;
                    }
                    earnings.push({ name: item.component.name, amount: amt });
                    grossEarned += amt;
                }
            }

            // Populate Deductions List
            let totalDeductions = 0;
            for (const item of structure) {
                if (item.component.type === 'DEDUCTION') {
                    let amt = item.amount;
                    if (!item.component.isFixed && item.component.percentage && basicAmount > 0) {
                        amt = (basicAmount * item.component.percentage) / 100;
                    }
                    deductions.push({ name: item.component.name, amount: amt });
                    totalDeductions += amt;
                }
            }

            // Add LOP to Deductions
            if (lopDeduction > 0) {
                deductions.push({ name: `Loss of Pay (${absentCount} days)`, amount: lopDeduction });
                totalDeductions += lopDeduction;
            }

            const netPay = grossEarned - totalDeductions;

            // D. Save Payslip
            const payslip = await payrollRepo.createPayslip({
                payrollRunId: run.id,
                employeeId: emp.id,
                basicSalary: basicAmount,
                allowances: grossEarned - basicAmount,
                deductions: totalDeductions,
                netPay: netPay,
                details: { earnings, deductions, absentDays: absentCount }
            });

            // E. Generate PDF
            const pdfPath = await pdfService.generatePayslipPdf(payslip, emp, run);

            // Update db with path
            await prisma.payslip.update({
                where: { id: payslip.id },
                data: { pdfPath }
            });

            results.push(payslip);
        }

        return { run, processedCount: results.length };
    }

    async getMyPayslips(employeeId: string) {
        return await payrollRepo.getEmployeePayslips(employeeId);
    }

    async downloadPayslip(id: string, userId: string, role: string) {
        const payslip = await payrollRepo.getPayslipById(id);
        if (!payslip) throw new Error("Payslip not found");

        // Security Check
        if (role !== 'ADMIN' && role !== 'HR' && payslip.employeeId !== userId) { // Warning: Checking userId vs employeeId needs care
            // For now assume userId maps to auth user Id. 
            // Ideally we check if user.employee.id === payslip.employeeId
            // But let's assume the passed 'userId' IS the employeeId derived from middleware for EMPLOYEE role.
            // (Controller will handle this mapping)
            if (payslip.employeeId !== userId) {
                throw new Error("Unauthorized access to this payslip");
            }
        }

        return payslip.pdfPath;
    }
}
