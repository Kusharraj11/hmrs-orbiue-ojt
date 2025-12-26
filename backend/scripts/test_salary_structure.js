async function testSalaryStructure() {
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

        // 2. Create Components
        const components = [
            { name: "Basic Salary", type: "EARNING", isFixed: true },
            { name: "HRA", type: "EARNING", isFixed: false, percentage: 40 }, // 40% of Basic
            { name: "Provident Fund", type: "DEDUCTION", isFixed: false, percentage: 12 } // 12% of Basic
        ];

        const createdComponents = [];
        console.log("2. Creating Salary Components...");

        for (const comp of components) {
            const res = await fetch('http://localhost:3000/api/payroll/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(comp)
            });
            const data = await res.json();
            if (data.status === 'success') {
                console.log(`   ✅ Created: ${data.data.name} (${data.data.id})`);
                createdComponents.push(data.data);
            } else {
                console.error(`   ❌ Failed: ${comp.name}`, data);
            }
        }

        // 3. Assign to Employee
        // Get Employee
        const empRes = await fetch('http://localhost:3000/api/employees', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const empData = await empRes.json();
        const employeeId = empData.data[0].id;
        console.log(`3. Assigning Structure to Employee: ${employeeId}...`);

        const structurePayload = {
            components: createdComponents.map(c => ({
                componentId: c.id,
                amount: c.isFixed ? 50000 : 0 // If fixed 50k, else 0 (pct based)
            }))
        };

        const structRes = await fetch(`http://localhost:3000/api/payroll/structure/${employeeId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(structurePayload)
        });
        const structData = await structRes.json();
        console.log("   Assignment Result:", structData.message);

        // 4. Verify Structure
        console.log("4. Verifying Structure...");
        const getRes = await fetch(`http://localhost:3000/api/payroll/structure/${employeeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();

        console.log("   Fetched Structure:");
        getData.data.forEach(item => {
            console.log(`   - ${item.component.name}: ${item.amount} (IsFixed: ${item.component.isFixed})`);
        });

        if (getData.data.length === 3) {
            console.log("✅ SUCCESS: Salary Structure verified.");
        } else {
            console.log("⚠️ CHECK RESULT: Count mismatch.");
        }

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
}

testSalaryStructure();
