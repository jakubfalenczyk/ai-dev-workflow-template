import prisma from './src/prisma';

// Helper to generate random date within last N months
function randomDate(monthsAgo: number): Date {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = now;
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to pick random item from array
function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate random amount within range
function randomAmount(min: number, max: number): number {
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

async function main() {
    console.log('Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();

    console.log('Seeding Meridian Commercial Bank demo data...\n');

    // ==========================================
    // CLIENTS (Customers)
    // ==========================================
    console.log('Creating clients...');

    const clientsData = [
        // Corporate Accounts
        { name: 'Apex Technologies Inc.', email: 'finance@apextech.com', phone: '(212) 555-0101', address: '350 Park Avenue, New York, NY 10022', status: 'ACTIVE' },
        { name: 'Sterling Manufacturing Co.', email: 'accounts@sterlingmfg.com', phone: '(312) 555-0102', address: '200 W Monroe St, Chicago, IL 60606', status: 'ACTIVE' },
        { name: 'Pacific Logistics Group', email: 'treasury@pacificlog.com', phone: '(415) 555-0103', address: '555 California St, San Francisco, CA 94104', status: 'ACTIVE' },
        { name: 'Atlantic Healthcare Systems', email: 'billing@atlantichc.com', phone: '(617) 555-0104', address: '75 State Street, Boston, MA 02109', status: 'ACTIVE' },
        { name: 'Meridian Real Estate Holdings', email: 'finance@meridianre.com', phone: '(305) 555-0105', address: '1395 Brickell Ave, Miami, FL 33131', status: 'ACTIVE' },
        { name: 'Crown Energy Partners', email: 'ap@crownenergy.com', phone: '(713) 555-0106', address: '1000 Louisiana St, Houston, TX 77002', status: 'ACTIVE' },
        { name: 'Vertex Software Solutions', email: 'finance@vertexsoft.com', phone: '(206) 555-0107', address: '400 Broad St, Seattle, WA 98109', status: 'ACTIVE' },
        { name: 'Global Import Export Ltd.', email: 'payments@globalimex.com', phone: '(310) 555-0108', address: '350 S Grand Ave, Los Angeles, CA 90071', status: 'ACTIVE' },

        // Small & Medium Businesses
        { name: 'Riverside Consulting Group', email: 'admin@riversidecg.com', phone: '(202) 555-0201', address: '1875 K Street NW, Washington, DC 20006', status: 'ACTIVE' },
        { name: 'Metro Construction LLC', email: 'accounting@metroconst.com', phone: '(469) 555-0202', address: '2100 Ross Ave, Dallas, TX 75201', status: 'ACTIVE' },
        { name: 'Pinnacle Legal Associates', email: 'billing@pinnaclelaw.com', phone: '(404) 555-0203', address: '303 Peachtree St NE, Atlanta, GA 30308', status: 'ACTIVE' },
        { name: 'Horizon Marketing Agency', email: 'finance@horizonmkt.com', phone: '(303) 555-0204', address: '1801 California St, Denver, CO 80202', status: 'ACTIVE' },
        { name: 'Summit Investment Advisors', email: 'ops@summitia.com', phone: '(602) 555-0205', address: '2 N Central Ave, Phoenix, AZ 85004', status: 'ACTIVE' },
        { name: 'Coastal Properties Inc.', email: 'ar@coastalprop.com', phone: '(619) 555-0206', address: '750 B Street, San Diego, CA 92101', status: 'INACTIVE' },

        // High Net Worth Individuals (Business Accounts)
        { name: 'Richardson Family Trust', email: 'trust@richardson-family.com', phone: '(212) 555-0301', address: '432 Park Avenue, New York, NY 10022', status: 'ACTIVE' },
        { name: 'Chen Holdings LLC', email: 'office@chenholdings.com', phone: '(415) 555-0302', address: '101 California Street, San Francisco, CA 94111', status: 'ACTIVE' },
        { name: 'Morrison Capital Partners', email: 'invest@morrisoncap.com', phone: '(312) 555-0303', address: '233 S Wacker Dr, Chicago, IL 60606', status: 'ACTIVE' },
        { name: 'Wellington Estate Management', email: 'admin@wellingtonestate.com', phone: '(617) 555-0304', address: '200 Clarendon St, Boston, MA 02116', status: 'ACTIVE' },

        // Additional Corporate Accounts
        { name: 'Northern Agricultural Co-op', email: 'finance@northernag.com', phone: '(515) 555-0401', address: '666 Grand Ave, Des Moines, IA 50309', status: 'ACTIVE' },
        { name: 'Bayshore Restaurant Group', email: 'accounting@bayshorerg.com', phone: '(813) 555-0402', address: '400 N Tampa St, Tampa, FL 33602', status: 'ACTIVE' },
        { name: 'Mountain View Tech Park', email: 'leasing@mvtechpark.com', phone: '(650) 555-0403', address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', status: 'ACTIVE' },
        { name: 'Liberty Transportation Inc.', email: 'fleet@libertytrans.com', phone: '(973) 555-0404', address: '1 Gateway Center, Newark, NJ 07102', status: 'INACTIVE' },
        { name: 'Quantum Pharmaceuticals', email: 'treasury@quantumpharma.com', phone: '(858) 555-0405', address: '4545 Towne Centre Ct, San Diego, CA 92121', status: 'ACTIVE' },
        { name: 'Heritage Insurance Brokers', email: 'finance@heritageins.com', phone: '(860) 555-0406', address: '1 State Street, Hartford, CT 06103', status: 'ACTIVE' },
    ];

    const clients = await Promise.all(
        clientsData.map((data) => prisma.customer.create({ data }))
    );

    console.log(`Created ${clients.length} clients\n`);

    // ==========================================
    // FINANCIAL PRODUCTS (Products)
    // ==========================================
    console.log('Creating financial products...');

    const productsData = [
        // Deposit Products
        { sku: 'DEP-CHK-001', name: 'Business Checking Account', description: 'Standard business checking with unlimited transactions, online banking, and mobile deposits', price: 0, stock: 999 },
        { sku: 'DEP-CHK-002', name: 'Premium Business Checking', description: 'Enhanced checking with earnings credit, wire transfer discounts, and dedicated support', price: 25, stock: 999 },
        { sku: 'DEP-SAV-001', name: 'Business Savings Account', description: 'High-yield business savings with competitive APY and easy transfers', price: 0.85, stock: 999 },
        { sku: 'DEP-MMA-001', name: 'Money Market Account', description: 'Tiered interest rates with check-writing privileges and FDIC insurance', price: 1.25, stock: 999 },
        { sku: 'DEP-CD-001', name: 'Certificate of Deposit - 12 Month', description: '12-month CD with guaranteed fixed rate and flexible terms', price: 4.50, stock: 500 },
        { sku: 'DEP-CD-002', name: 'Certificate of Deposit - 24 Month', description: '24-month CD with premium rate for longer commitment', price: 4.75, stock: 500 },

        // Lending Products
        { sku: 'LND-LOC-001', name: 'Business Line of Credit', description: 'Revolving credit line up to $500K for working capital needs', price: 50000, stock: 100 },
        { sku: 'LND-LOC-002', name: 'Premium Credit Facility', description: 'Enterprise credit facility up to $5M with customized terms', price: 500000, stock: 50 },
        { sku: 'LND-TRM-001', name: 'Term Loan - Equipment', description: 'Fixed-rate financing for equipment purchases up to $250K', price: 75000, stock: 200 },
        { sku: 'LND-TRM-002', name: 'Term Loan - Expansion', description: 'Growth capital for business expansion with flexible repayment', price: 150000, stock: 150 },
        { sku: 'LND-MTG-001', name: 'Commercial Mortgage', description: 'Commercial real estate financing with competitive rates', price: 1000000, stock: 75 },
        { sku: 'LND-SBA-001', name: 'SBA 7(a) Loan', description: 'Government-backed small business loan with favorable terms', price: 250000, stock: 100 },

        // Treasury & Cash Management
        { sku: 'TRS-ACH-001', name: 'ACH Processing Services', description: 'Automated clearing house for payroll and vendor payments', price: 0.25, stock: 999 },
        { sku: 'TRS-WIR-001', name: 'Domestic Wire Transfer', description: 'Same-day domestic wire transfers with tracking', price: 25, stock: 999 },
        { sku: 'TRS-WIR-002', name: 'International Wire Transfer', description: 'Global wire transfers in 130+ currencies', price: 45, stock: 999 },
        { sku: 'TRS-ZBA-001', name: 'Zero Balance Account', description: 'Automated cash concentration and disbursement', price: 150, stock: 500 },
        { sku: 'TRS-LBX-001', name: 'Lockbox Services', description: 'Accelerated receivables processing and deposits', price: 500, stock: 200 },

        // Card Products
        { sku: 'CRD-BUS-001', name: 'Business Credit Card', description: 'Corporate card with rewards, expense tracking, and controls', price: 10000, stock: 999 },
        { sku: 'CRD-PRM-001', name: 'Premium Corporate Card', description: 'Elite card with travel benefits, higher limits, and concierge', price: 50000, stock: 500 },
        { sku: 'CRD-PUR-001', name: 'Purchasing Card', description: 'Procurement card with detailed reporting and vendor management', price: 25000, stock: 750 },

        // Investment & Wealth
        { sku: 'INV-CON-001', name: 'Conservative Portfolio', description: 'Low-risk investment strategy focused on capital preservation', price: 50000, stock: 200 },
        { sku: 'INV-BAL-001', name: 'Balanced Growth Portfolio', description: 'Diversified portfolio balancing growth and income', price: 100000, stock: 200 },
        { sku: 'INV-GRO-001', name: 'Growth Portfolio', description: 'Aggressive growth strategy for long-term appreciation', price: 100000, stock: 200 },
    ];

    const products = await Promise.all(
        productsData.map((data) => prisma.product.create({ data }))
    );

    console.log(`Created ${products.length} financial products\n`);

    // ==========================================
    // TRANSACTIONS (Orders)
    // ==========================================
    console.log('Creating transactions...');

    const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'PENDING', 'CANCELLED'];

    // Generate 60 transactions spread over 12 months
    const transactionPromises = [];

    for (let i = 0; i < 60; i++) {
        const client = randomPick(clients.filter((c) => c.status === 'ACTIVE'));
        const status = randomPick(statuses);
        const orderDate = randomDate(12);

        // Pick 1-3 products for this transaction
        const numProducts = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [];
        const availableProducts = [...products];

        for (let j = 0; j < numProducts && availableProducts.length > 0; j++) {
            const idx = Math.floor(Math.random() * availableProducts.length);
            selectedProducts.push(availableProducts.splice(idx, 1)[0]);
        }

        // Calculate items and total
        const items = selectedProducts.map((product) => {
            const quantity = Math.floor(Math.random() * 3) + 1;
            // For banking products, price might represent rate, limit, or fee
            // We'll use it as the transaction amount basis
            let unitPrice = Number(product.price);
            if (unitPrice === 0) unitPrice = randomAmount(500, 5000); // For free products, generate realistic amounts
            else if (unitPrice < 100) unitPrice = randomAmount(1000, 10000); // For low-price items (fees/rates)
            else unitPrice = unitPrice * (0.5 + Math.random() * 0.5); // Partial utilization of credit/loan products

            return {
                productId: product.id,
                quantity,
                unitPrice: Math.round(unitPrice * 100) / 100,
            };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        transactionPromises.push(
            prisma.order.create({
                data: {
                    customerId: client.id,
                    status,
                    totalAmount: Math.round(totalAmount * 100) / 100,
                    orderDate,
                    items: {
                        create: items,
                    },
                },
            })
        );
    }

    // Add some high-value transactions for specific months to make charts interesting
    const highValueClients = clients.filter(
        (c) => c.name.includes('Trust') || c.name.includes('Holdings') || c.name.includes('Capital')
    );

    for (let month = 0; month < 12; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(Math.floor(Math.random() * 28) + 1);

        const client = randomPick(highValueClients.length > 0 ? highValueClients : clients);
        const loanProducts = products.filter((p) => p.sku.startsWith('LND-') || p.sku.startsWith('INV-'));
        const product = randomPick(loanProducts);

        const amount = randomAmount(50000, 500000);

        transactionPromises.push(
            prisma.order.create({
                data: {
                    customerId: client.id,
                    status: month < 2 ? 'PENDING' : 'COMPLETED',
                    totalAmount: amount,
                    orderDate: date,
                    items: {
                        create: [
                            {
                                productId: product.id,
                                quantity: 1,
                                unitPrice: amount,
                            },
                        ],
                    },
                },
            })
        );
    }

    const transactions = await Promise.all(transactionPromises);
    console.log(`Created ${transactions.length} transactions\n`);

    // Summary
    console.log('='.repeat(50));
    console.log('Seed completed successfully!');
    console.log('='.repeat(50));
    console.log(`Total Clients: ${clients.length}`);
    console.log(`Total Financial Products: ${products.length}`);
    console.log(`Total Transactions: ${transactions.length}`);
    console.log('\nRun the server and visit http://localhost:5173 to see the demo.');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
