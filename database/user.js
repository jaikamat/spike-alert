const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    // username: String,
    email: String,
    password: String
    // cardList: [{ type: Number, ref: 'Card' }]
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;

module.exports.createUser = async function(newUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);

    newUser.password = hash;

    return await newUser.save();
};

module.exports.getUserByEmail = async function(email) {
    console.log('getting email', email);
    return await UserModel.findOne({ email: email });
};

module.exports.getUserById = async function(id) {
    return await UserModel.findById(id);
};

module.exports.comparePassword = function(password, hash) {
    return bcrypt.compareSync(password, hash);
};
