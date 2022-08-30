const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  joined: { type: Date, required: true },
});

module.exports = mongoose.model('User', UserSchema);
