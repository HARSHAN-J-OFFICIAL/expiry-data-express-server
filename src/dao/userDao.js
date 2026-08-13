const User = require('../models/user');

const userDao = {
    findByEmail: async (email) => {
        const user = await User.findOne({ email });
        return user;
    },
    findById: async (id) => {
        const user = await User.findById(id);
        return user;
    },
    create: async (userData) => {
        const user = new User(userData);
        return await user.save();
    }
};

module.exports = userDao;
