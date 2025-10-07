import { getDB } from './db';
import type { User, Boat, Order, Batch } from '../types';

export async function seedDatabase(): Promise<void> {
  const db = await getDB();

  // Check if already seeded
  const existingUsers = await db.getAll('users');
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  // Seed users
  const users: User[] = [
    {
      id: 'user-admin',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash: 'demo123', // Plain text for demo
      active: true,
    },
    {
      id: 'user-delivery',
      email: 'delivery@example.com',
      name: 'Delivery Driver',
      role: 'delivery',
      passwordHash: 'demo123',
      active: true,
    },
    {
      id: 'user-customer',
      email: 'customer@example.com',
      name: 'Customer User',
      role: 'customer',
      passwordHash: 'demo123',
      active: true,
    },
  ];

  for (const user of users) {
    await db.add('users', user);
  }

  // Seed boats with dummy images
  const boats: Boat[] = [
    {
      id: 'boat-nej',
      code: 'NEJ',
      name: 'Nejma',
      slug: 'nejma',
      active: true,
      summary: 'Fast and reliable cargo boat serving Male and nearby islands',
      aboutMd: '# About Nejma\n\nNejma is our flagship cargo boat, operating since 2010. Known for reliability and speed.',
      deliveryNotesMd: '# Delivery Information\n\nDeliveries are made every Tuesday and Friday. Please ensure contact person is available.',
      images: [
        {
          id: 'img-nej-1',
          dataUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23007bff" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="white"%3ENejma%3C/text%3E%3C/svg%3E',
          caption: 'Nejma cargo boat',
          sortOrder: 0,
          isCover: true,
        },
      ],
    },
    {
      id: 'boat-sun',
      code: 'SUN',
      name: 'Sunrise Express',
      slug: 'sunrise-express',
      active: true,
      summary: 'Premium express service with daily departures',
      aboutMd: '# About Sunrise Express\n\nOur newest addition to the fleet, offering premium express delivery services.',
      deliveryNotesMd: '# Delivery Information\n\nDaily departures at 8 AM. Same-day delivery available for orders placed before 6 AM.',
      images: [
        {
          id: 'img-sun-1',
          dataUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ffc107" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="white"%3ESunrise Express%3C/text%3E%3C/svg%3E',
          caption: 'Sunrise Express',
          sortOrder: 0,
          isCover: true,
        },
      ],
    },
  ];

  for (const boat of boats) {
    await db.add('boats', boat);
  }

  // Seed orders
  const orders: Order[] = [
    {
      id: 'order-1',
      shortCode: '001',
      customerId: 'user-customer',
      createdAt: new Date().toISOString(),
      status: 'submitted',
      product: { sku: 'CHILLI-250G', name: 'Chilli Paste 250g', priceMvr: 50 },
      qty: 2,
      totalMvr: 100,
      destinationType: 'address',
      address: {
        addressLine: 'H. Sunrise',
        island: 'Thulusdhoo',
        atoll: 'Kaafu',
        contactName: 'Ahmed Ali',
        contactPhone: '7778888',
      },
    },
    {
      id: 'order-2',
      shortCode: '002',
      customerId: 'user-customer',
      createdAt: new Date().toISOString(),
      status: 'payment_confirmed',
      product: { sku: 'CHILLI-500G', name: 'Chilli Paste 500g', priceMvr: 90 },
      qty: 1,
      totalMvr: 90,
      destinationType: 'boat',
      boatId: 'boat-nej',
      paymentSlipDataUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100"%3E%3Crect fill="%2328a745" width="200" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="white"%3EPayment Slip%3C/text%3E%3C/svg%3E',
    },
    {
      id: 'order-3',
      shortCode: '003',
      customerId: 'user-customer',
      createdAt: new Date().toISOString(),
      status: 'preparing',
      product: { sku: 'CHILLI-250G', name: 'Chilli Paste 250g', priceMvr: 50 },
      qty: 3,
      totalMvr: 150,
      destinationType: 'boat',
      boatId: 'boat-sun',
    },
  ];

  for (const order of orders) {
    await db.add('orders', order);
  }

  // Seed a batch
  const batches: Batch[] = [
    {
      id: 'batch-1',
      title: 'Morning Run - Oct 7',
      status: 'planning',
      orderIds: ['order-2', 'order-3'],
    },
  ];

  for (const batch of batches) {
    await db.add('batches', batch);
  }

  console.log('Database seeded successfully!');
}
