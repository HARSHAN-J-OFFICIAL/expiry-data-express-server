const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/userDao');

const authController = {
    register: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const { name, email, password } = request.body;

            const existingUser = await userDao.findByEmail(email);
            if (existingUser) {
                return response.status(400).json({
                    message: 'User already exists with this email'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await userDao.create({
                name,
                email,
                password: hashedPassword
            });

            const token = jwt.sign(
                {
                    name: newUser.name,
                    email: newUser.email,
                    _id: newUser._id
                },
                process.env.JWT_SECRET || 'jwt_secret_key',
                { expiresIn: '1h' }
            );

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });

            return response.status(201).json({
                message: 'User registered successfully',
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email
                },
                token
            });
        } catch (error) {
            console.error('Register error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    login: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const { email, password } = request.body;

            const user = await userDao.findByEmail(email);

            const isPasswordMatched = user ? await bcrypt.compare(password, user?.password) : false;

            if (user && isPasswordMatched) {
                const token = jwt.sign(
                    {
                        name: user.name,
                        email: user.email,
                        _id: user._id
                    },
                    process.env.JWT_SECRET || 'jwt_secret_key',
                    { expiresIn: '1h' }
                );

                response.cookie('jwtToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/'
                });

                return response.status(200).json({
                    message: 'User authenticated',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email
                    },
                    token
                });
            } else {
                return response.status(400).json({
                    message: 'Invalid email or password'
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    logout: async (request, response) => {
        try {
            response.clearCookie('jwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });

            return response.status(200).json({
                message: 'User logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = authController;
