const express = require("express");
const Router = express.Router();
const userRouter = require("./userRoutes")
const survey = require("./survey")
Router.use("/", userRouter)
Router.use("/survey", survey)
module.exports = Router