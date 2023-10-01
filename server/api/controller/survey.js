const surveyModel = require("../model/surveyModel");
const questionModel = require("../model/questionModel");
const userModel = require("../model/userModel");
const mailModal = require("../model/mailModal");
const answerModal = require("../model/answerModal");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { SECRET_KET } = require("../../constant");

exports.postSurvey = async (req, res) => {
  try {
    const { title, money, questions } = req.body;

    const survey = new surveyModel({
      title,
      money,
      userID: req.user._id,
      status: "pending",
    });
    const newSurvey = await survey.save();
    if (newSurvey) {
      for (let i = 0; i < questions.length; i++) {
        const question = new questionModel({
          surveyID: newSurvey._id,
          title: questions[i].title,
          question: questions[i].question,
        });
        const newQuestion = await question.save();
        newSurvey.question.push(newQuestion._id);
        await newSurvey.save();
      }
    }

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSurvey = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    let data = [];
    let count = 0;
    const searh = {
      status,
    };
    if (keyword) {
      searh["title"] = {  $regex: keyword };
    }
    if (req.user.role === "user") {
      data = await surveyModel
        .find({ ...searh, userID: req.user._id })
        .populate("userID")
        .populate("question");

      count = await surveyModel
        .countDocuments({ ...searh, userID: req.user._id })
        .populate("userID")
        .populate("question");
    } else {
      data = await surveyModel
        .find({ ...searh })
        .populate("userID")
        .populate("question");

      count = await surveyModel
        .countDocuments({ ...searh })
        .populate("userID")
        .populate("question");
    }

    res.status(200).json({ message: "success", data, count });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { id } = req.query;

    data = await surveyModel.findOne({ _id: id }).populate("question");

    res.status(200).json({ message: "success", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getAdminDetail = async (req, res) => {
  try {
    const { id } = req.query;

    const data = await mailModal
      .find({ surveyID: id, isAnswer: true })
      .populate("surveyID")
      .populate("answerID");

    const dataSend = await mailModal
      .find({ surveyID: id })
      .populate("surveyID")
      .populate("answerID");

    const survey = await surveyModel.findById(id);
    res.status(200).json({
      message: "success",
      data: dataSend,
      countAnsews: data.length,
      countSend: dataSend.length,
      survey,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getAdminDetailSurvey = async (req, res) => {
  try {
    const { id, mail } = req.query;
    const mails = await mailModal.findOne({
      surveyID: id,
      isAnswer: true,
      mail: mail,
    });

    const answers = await answerModal
      .find({ mailID: mails._id })
      .populate("questionID");

    res.status(200).json({
      message: "success",
      data: answers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.putSurvey = async (req, res) => {
  try {
    const { title, money, questions, status, id } = req.body;

    let survey = await surveyModel.findOne({ _id: id });
    console.log("survey", survey);
    survey.title = title || survey.title;
    survey.money = money || survey.money;
    survey.status = status || survey.status;
    if (questions && questions.length > 0) {
      survey.question = [];
    }
    let newSurvey = await survey.save();

    for (let i = 0; i < questions.length; i++) {
      const question = new questionModel({
        surveyID: newSurvey._id,
        title: questions[i].title,
        question: questions[i].question,
      });
      const newQuestion = await question.save();
      newSurvey.question.push(newQuestion._id);
      await newSurvey.save();
    }

    res.json({ newSurvey });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { answers, token, surveyId } = req.body;
    let data = jwt.verify(token, SECRET_KET);

    const user = await userModel.findOne({ userName: data.userName });
    if (!user) {
      res.status(400).json({ message: "user not exist" });
    }

    const mailSchema = await mailModal.findOne({
      surveyID: surveyId,
      mail: user.mail,
      isAnswer: false,
    });
    if (!mailSchema) {
      res.json({ message: "something wrong" });
    }
    for (let i = 0; i < (answers || []).length; i++) {
      const answer = new answerModal({
        mailID: mailSchema._id,
        answer: answers[i].answer,
        questionID: answers[i].questionId,
      });
      const newAnswer = await answer.save();
      if (newAnswer) {
        mailSchema.answerID.push(newAnswer._id);
        mailSchema.isAnswer = true;
        await mailSchema.save();
      }
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.sendMail = async (req, res) => {
  try {
    const { mail, idSurvey } = req.body;
    let sendMailError = [];
    let sendMailSuccess = [];
    let survey = await surveyModel.findOne({ _id: idSurvey });
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "testmmud@gmail.com",
        pass: "gkqwtllcabqnuqpo",
      },
    });

    if (!survey) {
      res.json({ message: "Cannot find survey" });
    }

    for (let i = 0; i < (mail || []).length; i++) {
      const user = await userModel.findOne({ mail: mail[i] });
      if (!user) {
        sendMailError.push(m);
        continue;
      }

      const mailCurrent = await mailModal.findOne({
        mail: mail[i],
        surveyID: idSurvey,
      });
      if (mailCurrent) {
        continue;
      }
      const token = await jwt.sign(
        { userName: user.userName, mail: mail[i], idSurvey },
        SECRET_KET
      );
      var mainOptions = {
        // thiết lập đối tượng, nội dung gửi mail
        from: "MTai",
        to: mail[i],
        subject: "Thư mời khảo sát",
        text: "You recieved message from Tai",
        html:
          "<p>Vui Lòng nhấp theo đường để khảo sát </p>" +
          ` <a
                href="http://localhost:3000/survey-answer?token=${token}&surveyId=${idSurvey}"
                target={"_blank"}
                rel="noopener noreferrer"
                >
                Click here
                </a>`,
      };
      transporter.sendMail(mainOptions, async function (err, info) {
        if (err) {
          sendMailError.push(mail[i]);
        } else {
          sendMailSuccess.push(mail[i]);
          const newMail = new mailModal({ mail: mail[i], surveyID: idSurvey });
          await newMail.save();
        }
      });
    }
    res.json({ message: "success", sendMailError, sendMailSuccess });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
