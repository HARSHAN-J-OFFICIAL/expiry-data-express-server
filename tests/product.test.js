const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../src/routes/authRoutes');
const productRoutes = require('../src/routes/productRoutes');

let mongoServer;
let app;
let jwtCookie;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/auth', authRoutes);
    app.use('/products', productRoutes);

    // Create a test user and obtain cookie
    const res = await request(app)
        .post('/auth/register')
        .send({
            name: 'Product Tester',
            email: 'producttester@example.com',
            password: 'password123'
        });
    
    jwtCookie = res.headers['set-cookie'][0];
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Product APIs Integration Tests', () => {
    let createdProductId;

    describe('POST /products', () => {
        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/products')
                .send({ title: 'Milk', expiryDate: '2026-09-01' });

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Unauthorized');
        });

        it('should fail validation when title is missing', async () => {
            const res = await request(app)
                .post('/products')
                .set('Cookie', [jwtCookie])
                .send({ expiryDate: '2026-09-01' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should successfully create a new product', async () => {
            const res = await request(app)
                .post('/products')
                .set('Cookie', [jwtCookie])
                .send({
                    title: 'Organic Milk 1L',
                    upcCode: '073210001234',
                    amount: '1 bottle',
                    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'Dairy',
                    location: 'Fridge'
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Product created successfully');
            expect(res.body.product).toHaveProperty('_id');
            expect(res.body.product.title).toBe('Organic Milk 1L');
            expect(res.body.product.upcCode).toBe('073210001234');

            createdProductId = res.body.product._id;
        });
    });

    describe('GET /products', () => {
        it('should retrieve paginated list of products (max 20 per page)', async () => {
            const res = await request(app)
                .get('/products?page=1&limit=20')
                .set('Cookie', [jwtCookie]);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.pagination.pageSize).toBeLessThanOrEqual(20);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should filter products by search query (title or UPC)', async () => {
            const res = await request(app)
                .get('/products?search=073210001234')
                .set('Cookie', [jwtCookie]);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].upcCode).toBe('073210001234');
        });

        it('should filter products by expiry range (1month)', async () => {
            const res = await request(app)
                .get('/products?expiryFilter=1month')
                .set('Cookie', [jwtCookie]);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /products/:id', () => {
        it('should retrieve product by ID', async () => {
            const res = await request(app)
                .get(`/products/${createdProductId}`)
                .set('Cookie', [jwtCookie]);

            expect(res.status).toBe(200);
            expect(res.body.product._id).toBe(createdProductId);
            expect(res.body.product.title).toBe('Organic Milk 1L');
        });

        it('should return 404 for invalid ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/products/${fakeId}`)
                .set('Cookie', [jwtCookie]);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /products/:id', () => {
        it('should update existing product', async () => {
            const res = await request(app)
                .put(`/products/${createdProductId}`)
                .set('Cookie', [jwtCookie])
                .send({
                    title: 'Organic Milk 2L',
                    amount: '2 bottles'
                });

            expect(res.status).toBe(200);
            expect(res.body.product.title).toBe('Organic Milk 2L');
            expect(res.body.product.amount).toBe('2 bottles');
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete product', async () => {
            const res = await request(app)
                .delete(`/products/${createdProductId}`)
                .set('Cookie', [jwtCookie]);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Product deleted successfully');

            // Verify deletion
            const getRes = await request(app)
                .get(`/products/${createdProductId}`)
                .set('Cookie', [jwtCookie]);

            expect(getRes.status).toBe(404);
        });
    });
});
