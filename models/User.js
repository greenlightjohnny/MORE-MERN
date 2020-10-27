const { string } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },

  email: {
    type: String,
    required: true,
    minlength: 6,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  testMe: {
    type: String,
    default: "hello",
  },
  createdAt: {
    type: Date,
    expires: "2m",
    default: Date.now,
  },
});

module.exports = User = mongoose.model("user", userSchema);

// Or this Way:
// const User = mongoose.model("User", UserSchema);
// module.exports = User;
