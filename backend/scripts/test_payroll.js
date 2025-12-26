async function testPayroll() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token;
        if (!token) throw new Error("Login failed");
        console.log("Login successful.");

        // 2. Run Payroll
        console.log("2. Running Payroll for 12/2025...");
        const runRes = await fetch('http://localhost:3000/api/payroll/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ month: 12, year: 2025 })
        });
        const runData = await runRes.json();

        if (runData.status === 'success') {
            console.log(`✅ Payroll Run Created: RunID ${runData.data.run.id}`);
            console.log(`   Processed Slips: ${runData.data.processedCount}`);
        } else {
            console.error("❌ Payroll Run Failed:", runData);
            return;
        }

        // 3. Get My Payslips (Simulating Admin/User checking)
        console.log("3. Fetching Payslips...");
        // Assuming Admin is also an employee or we can query DB directly in real app, 
        // but here let's just use the Admin token to hit the 'me' endpoint. 
        // If Admin has no employee profile, this might return empty or error.

        // Let's create a new employee token if needed. BUT, assuming the employee from previous tests (caabb988...) exists.
        // I will use a direct login for that employee if I knew credentials.
        // Instead, I'll rely on the earlier Admin Login -> but Admin user usually is linked to an Employee profile in test seed.

        const meRes = await fetch('http://localhost:3000/api/payroll/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        console.log(`   Found ${meData.data ? meData.data.length : 0} payslips for current user.`);

        if (meData.data && meData.data.length > 0) {
            const slip = meData.data[0];
            console.log(`   Latest Payslip: Net Pay ${slip.netPay}`);
            console.log(`   PDF Path: ${slip.pdfPath}`);

            // 4. Download PDF
            const downloadUrl = `http://localhost:3000/api/payroll/${slip.id}/download`;
            console.log(`4. Downloading PDF from ${downloadUrl}...`);
            const dlRes = await fetch(downloadUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (dlRes.status === 200) {
                console.log("✅ PDF Download Successful (Headers received).");
            } else {
                console.error(`❌ Download Failed: ${dlRes.status}`);
            }
        } else {
            console.log("⚠️ No payslips found for logged-in user. (Test User might not be an Active Employee or have Structure)");
        }

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
}

testPayroll();
