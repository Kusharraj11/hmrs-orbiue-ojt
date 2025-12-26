async function testIngest() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log('Login successful. Token obtained.');

        console.log("2. Fetching Employees to get a valid ID...");
        const empRes = await fetch('http://localhost:3000/api/employees', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!empRes.ok) throw new Error(`Fetch Employees failed: ${empRes.statusText}`);
        const empData = await empRes.json();

        if (!empData.data || empData.data.length === 0) {
            throw new Error("No employees found. Seed database first.");
        }

        const employeeId = empData.data[0].id;
        console.log('Using Employee ID:', employeeId);

        console.log("3. Ingesting Attendance Record...");
        const ingestRes = await fetch('http://localhost:3000/api/attendance/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                employeeId: employeeId,
                timestamp: new Date().toISOString(),
                type: 'IN',
                device: 'Gate-TEST-SCRIPT'
            })
        });

        if (!ingestRes.ok) {
            const errText = await ingestRes.text();
            throw new Error(`Ingest failed: ${ingestRes.status} - ${errText}`);
        }

        const ingestData = await ingestRes.json();
        console.log('✅ Ingestion Successful!');
        console.log('Response:', JSON.stringify(ingestData, null, 2));

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testIngest();
