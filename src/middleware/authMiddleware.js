const jwt = require('jsonwebtoken');

const authMiddleware = {
    protect: async (request, response, next) => {
        try {
            let token = request.cookies?.jwtToken;

            // Also check Authorization header (Bearer <token>)
            if (!token && request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
                token = request.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return response.status(401).json({
                    message: 'Unauthorized access. No token provided.'
                });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');
                request.user = decoded;
                next();
            } catch (error) {
                return response.status(401).json({
                    message: 'Unauthorized access. Invalid or expired token.'
                });
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = authMiddleware;
