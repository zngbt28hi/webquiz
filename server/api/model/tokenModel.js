const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const tokenSchema = new Schema({
  token: {
    type: String,
    required: [true],
    unique: true,
  },
  userID: { type: mongoose.Types.ObjectId, ref: "user" },

  isUsed: {
    type: Boolean,
    required: true,
    default: false,
  },
});
const tokenModel = model("token", tokenSchema);

module.exports = tokenModel;
