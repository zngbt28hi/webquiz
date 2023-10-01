const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const answerSchema = new Schema({
    mailID: {type: mongoose.Types.ObjectId, ref: "mail"},
    answer: {
        type: String,
    },
    questionID: { type: mongoose.Types.ObjectId, ref: "question" },
});
const answerModal = model("answer", answerSchema);

module.exports = answerModal;