const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,

    minlength: 6,
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
});

module.exports = User = mongoose.model("user", userSchema);

// Or this Way:
// const User = mongoose.model("User", UserSchema);
// module.exports = User;
