const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const surveySchema = new Schema({
  title: {
    type: String,
    required: [true],
  },
  userID: { type: mongoose.Types.ObjectId, ref: "user" },
  money: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["accept", "reject", "pending"],
  },
  question: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
    },
  ],
});
const surveyModel = model("survey", surveySchema);

module.exports = surveyModel;
