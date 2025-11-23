import prisma from './src/prisma';

async function main() {
    console.log('Seeding database...');

    // Create Customers
    const customer1 = await prisma.customer.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            address: '123 Main St',
            status: 'ACTIVE',
        },
    });

    const customer2 = await prisma.customer.create({
        data: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '987-654-3210',
            address: '456 Oak Ave',
            status: 'ACTIVE',
        },
    });

    console.log('Created customers:', customer1.name, customer2.name);

    // Create Products
    const product1 = await prisma.product.create({
        data: {
            sku: 'PROD-001',
            name: 'Laptop',
            description: 'High performance laptop',
            price: 1200.00,
            stock: 50,
        },
    });

    const product2 = await prisma.product.create({
        data: {
            sku: 'PROD-002',
            name: 'Mouse',
            description: 'Wireless mouse',
            price: 25.50,
            stock: 100,
        },
    });

    console.log('Created products:', product1.name, product2.name);

    // Create Order
    const order = await prisma.order.create({
        data: {
            customerId: customer1.id,
            totalAmount: 1225.50,
            status: 'COMPLETED',
            items: {
                create: [
                    {
                        productId: product1.id,
                        quantity: 1,
                        unitPrice: 1200.00,
                    },
                    {
                        productId: product2.id,
                        quantity: 1,
                        unitPrice: 25.50,
                    },
                ],
            },
        },
        include: {
            items: true,
        },
    });

    console.log('Created order:', order.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
