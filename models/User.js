const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    minlength: 5,
  },
});

module.exports;
