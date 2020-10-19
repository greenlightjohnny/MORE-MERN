const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 },
});

module.exports = User = mongoose.model("tok", tokenSchema);
