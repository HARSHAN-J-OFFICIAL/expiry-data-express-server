const User = require('../models/user');

const userDao = {
    findByEmail: async (email) => {
        if (!email) return null;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        return user;
    },
    findById: async (id) => {
        const user = await User.findById(id);
        return user;
    },
    create: async (userData) => {
        if (userData && userData.email) {
            userData.email = userData.email.toLowerCase().trim();
        }
        const user = new User(userData);
        return await user.save();
    }
};

module.exports = userDao;
