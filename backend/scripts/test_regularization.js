async function testRegularization() {
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
        const employeeId = empData.data[0].id;

        // 1. Create a Late Record (Clean Slate)
        const date = new Date().toISOString().split('T')[0];
        const nineFifty = new Date(`${date}T09:50:00+05:30`).toISOString();
        const sixPm = new Date(`${date}T18:00:00+05:30`).toISOString();

        console.log(`2. Creating LATE record for ${date}...`);
        // Ingest 09:50
        await fetch('http://localhost:3000/api/attendance/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ employeeId, timestamp: nineFifty, type: 'IN' })
        });
        // Ingest 18:00
        await fetch('http://localhost:3000/api/attendance/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ employeeId, timestamp: sixPm, type: 'OUT' })
        });

        // Process
        const processRes = await fetch('http://localhost:3000/api/attendance/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ employeeId, date: date })
        });
        const processData = await processRes.json();
        const recordId = processData.data.id;
        console.log(`Record Created: ${recordId} [Status: ${processData.data.status}]`);

        // 2. Regularize it to 09:00 AM
        console.log("3. Regularizing to 09:00 AM...");
        const newCheckIn = new Date(`${date}T09:00:00+05:30`).toISOString();
        const newCheckOut = new Date(`${date}T18:00:00+05:30`).toISOString();

        const regRes = await fetch(`http://localhost:3000/api/attendance/${recordId}/regularize`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                checkIn: newCheckIn,
                checkOut: newCheckOut,
                remarks: "Forgot ID card, actually present on time."
            })
        });

        const regData = await regRes.json();
        console.log("Regularization Result:", JSON.stringify(regData, null, 2));

        if (regData.status === 'success' && regData.data.status === 'PRESENT' && regData.data.isManual === true) {
            console.log("✅ SUCCESS: Record regularized to PRESENT and marked isManual.");
        } else {
            console.log("⚠️ CHECK RESULT: Status or flags mismatch.");
        }

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
}

testRegularization();
