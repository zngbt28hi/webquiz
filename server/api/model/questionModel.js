const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const questionSchema = new Schema({
  surveyID: { type: mongoose.Types.ObjectId, ref: "survey" },
  title: {
    type: String,
    required: [true],
  },
  question: {
    type: String,
    required: [true],
  },
});
const questionModel = model("question", questionSchema);

module.exports = questionModel;
