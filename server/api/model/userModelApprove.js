const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const userApproveSchema = new Schema({
  user: {
    type: String,
    required: [true, "nhập user name bạn ơiii!"],
  },
  userName: {
    type: String,
    required: [true, "nhập user name bạn ơiii!"],
  },
  mail: {
    type: String,
    required: [true, "nhập mail bạn ơiii!"],
  },
  phone: {
    type: Number,
  },
  address: {
    type: String,
  },
  approve: {
    type: String,
    enum: ["accept", "reject", "pending"],
    default: "pending",
  },
});

const userApproveModel = model("userApprove", userApproveSchema);

module.exports = userApproveModel;
