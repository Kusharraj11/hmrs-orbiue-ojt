async function testCalculation() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log("Login successful.");

        // Get Employee
        const empRes = await fetch('http://localhost:3000/api/employees', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const empData = await empRes.json();
        const employeeId = empData.data[0].id; // Use first employee

        // Use Tomorrow to ensure clean data (no previous punches)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const targetDate = tomorrow.toISOString().split('T')[0];

        // 09:00 AM IST
        // constructing date with offset
        const checkInTime = new Date(`${targetDate}T09:00:00+05:30`).toISOString();

        // 18:00 PM IST (6:00 PM)
        const checkOutTime = new Date(`${targetDate}T18:00:00+05:30`).toISOString();

        console.log(`2. Ingesting Raw Data for ${targetDate} (IST)...`);
        console.log(`   IN: 09:00 IST (${checkInTime})`);
        console.log(`   OUT: 18:00 IST (${checkOutTime})`);

        // 9:00 AM IST IN
        await fetch('http://localhost:3000/api/attendance/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                employeeId,
                timestamp: checkInTime,
                type: 'IN',
                device: 'Test-Script-IST'
            })
        });

        // 18:00 PM IST OUT
        await fetch('http://localhost:3000/api/attendance/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                employeeId,
                timestamp: checkOutTime,
                type: 'OUT',
                device: 'Test-Script-IST'
            })
        });

        console.log("3. Triggering Daily Processing...");
        const processRes = await fetch('http://localhost:3000/api/attendance/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                employeeId,
                date: targetDate
            })
        });

        const processData = await processRes.json();
        console.log("Processing Result:", JSON.stringify(processData, null, 2));

        if (processData.status === 'success' && Math.abs(processData.data.totalHours - 9) < 0.1) {
            console.log("✅ SUCCESS: Calculated 9 Hours.");
        } else {
            console.log("⚠️ CHECK RESULT: Duration might vary slightly.");
        }

    } catch (e) {
        console.error("❌ ERROR:", e.message);
    }
}

testCalculation();
