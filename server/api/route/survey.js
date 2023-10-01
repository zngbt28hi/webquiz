const express = require("express");
const Router = express.Router();
const surveyContainer = require("../controller/survey");
const middlewareAuth = require("../middleware/authen");

Router.route("/")
  .get(middlewareAuth.auth, surveyContainer.getSurvey)
  .post(middlewareAuth.auth, surveyContainer.postSurvey)
  .put(middlewareAuth.auth, surveyContainer.putSurvey);
Router.route("/sendMail").post(middlewareAuth.auth, surveyContainer.sendMail);
Router.route("/admin-detail").get(middlewareAuth.auth, surveyContainer.getAdminDetail);
Router.route("/admin-detail-survey").get(middlewareAuth.auth, surveyContainer.getAdminDetailSurvey);
Router.route("/detail").get(surveyContainer.getDetail);
Router.route("/survey-answer").post(surveyContainer.submitAnswer);

// put delete;
module.exports = Router;
