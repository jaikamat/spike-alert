const mongoose = require('mongoose');

const NameCacheSchema = new mongoose.Schema({
    _id: mongoose.Schema.ObjectId,
    cache: [String]
});

const NameCacheModel = mongoose.model('Title', NameCacheSchema);

module.exports.NameCacheModel = NameCacheModel;
