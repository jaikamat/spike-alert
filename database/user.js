const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    cardList: [{ type: Number, ref: 'Card' }]
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

module.exports.addCardToList = async function(userId, cardId) {
    const user = await UserModel.findById(userId);

    user.cardList.push({ _id: cardId });

    return user.save();
};

module.exports.getUserList = async function(userId) {
    const user = await UserModel.findById(userId).populate('cardList');

    return user.cardList;
};

module.exports.removeCardFromList = async function(userId, cardId) {
    return await UserModel.findOneAndUpdate(
        { _id: userId },
        {
            $pull: {
                cardList: cardId
            }
        },
        {
            new: true
        }
    );
};
