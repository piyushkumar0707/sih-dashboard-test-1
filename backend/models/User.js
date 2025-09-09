const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'officer', 'tourist'], default: 'tourist' },
  status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
  verified: { type: Boolean, default: false },
  location: { type: String, default: 'Unknown' },
  lastActive: { type: Date, default: Date.now },
  joinedDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
