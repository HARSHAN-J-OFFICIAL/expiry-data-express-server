const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../src/routes/authRoutes');
const setupSwagger = require('../src/config/swagger');

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    setupSwagger(app);
    app.use('/auth', authRoutes);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth APIs Integration Tests', () => {
    const testUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
    };

    describe('POST /auth/register', () => {
        it('should fail with validation error when name is missing', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });
            
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should fail with validation error when password is too short', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ name: 'Short', email: 'short@example.com', password: '123' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0].msg).toBe('Password must be at least 6 characters long');
        });

        it('should successfully register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('User registered successfully');
            expect(res.body.user).toHaveProperty('_id');
            expect(res.body.user.email).toBe(testUser.email.toLowerCase());
            expect(res.body.user.name).toBe(testUser.name);
            expect(res.body).toHaveProperty('token');
            expect(res.headers['set-cookie'][0]).toContain('jwtToken');
        });

        it('should fail when registering with an existing email', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send(testUser);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User already exists with this email');
        });
    });

    describe('POST /auth/login', () => {
        it('should fail when email is not registered', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'nonexistent@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: testUser.email, password: 'wrongpassword' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should successfully login with valid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: testUser.email, password: testUser.password });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User authenticated');
            expect(res.body.user.email).toBe(testUser.email.toLowerCase());
            expect(res.body).toHaveProperty('token');
            expect(res.headers['set-cookie'][0]).toContain('jwtToken');
        });
    });

    describe('POST /auth/logout', () => {
        it('should clear jwtToken cookie and return 200 on logout', async () => {
            const res = await request(app)
                .post('/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User logged out successfully');
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toContain('jwtToken=;');
        });
    });

    describe('GET /api-docs', () => {
        it('should serve Swagger UI documentation', async () => {
            const res = await request(app).get('/api-docs/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('Swagger UI');
        });
    });
});
