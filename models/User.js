const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roles = ['admin', 'user', 'guest'];

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: roles, default: 'user' } 
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
