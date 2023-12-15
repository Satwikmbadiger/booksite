const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const cartItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  quantity: { type: Number, default: 1 },
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  cart: {
    items: [cartItemSchema],
  },
});

userSchema.pre('save', async function (next) {
  try {
    const user = this;

    // Only hash the password if it has been modified or is new
    if (!user.isModified('password')) {
      return next();
    }

    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
