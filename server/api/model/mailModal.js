const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const mailSchema = new Schema({
  surveyID: { type: mongoose.Types.ObjectId, ref: "survey" },
  mail: {
    type: String,
  },
  answerID: [{ type: mongoose.Types.ObjectId, ref: "answer" }],
  isAnswer: {
    type: Boolean,
    default: false,
  },
});
const mailModal = model("mail", mailSchema);

module.exports = mailModal;
