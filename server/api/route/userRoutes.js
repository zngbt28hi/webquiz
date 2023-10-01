const express = require("express");
const Router = express.Router();
const userController = require("../controller/userController");
const middlewareAuth = require("../middleware/authen");

// đăng kí tài khoản
Router.route("/regester").post(userController.regester);
Router.route("/authorization").get(userController.authorization);
// đăng nhập
Router.route("/login").post(userController.login);
Router.route("/setcookie").post(userController.setCookie);
// quên mật khẩu
Router.route("/forget-password").post(userController.forgetPassword);
Router.route("/reset-password").post(userController.ResetPassword);
Router.route("/change-password").post(userController.changePassword);
// logout
Router.route("/logout").get(userController.logout);
Router.route("/getAllUser").get(userController.getUserActive);

// chỉ định làm admin
Router.route("/termAdmin").post(
  middlewareAuth.auth,
  middlewareAuth.isAdmin,
  userController.termAdmin
);
Router.route("/user")
  .get(middlewareAuth.auth, userController.getUser)
  .post(middlewareAuth.auth, userController.postUser)
  .put(middlewareAuth.auth, userController.putUser)
  .delete(
    middlewareAuth.auth,
    middlewareAuth.isAdmin,
    userController.deleteUser
  );

Router.route("/staff")
  .get(middlewareAuth.auth, userController.getStaff)
  .post(middlewareAuth.auth, userController.postStaff)
  .put(middlewareAuth.auth, middlewareAuth.isAdmin, userController.putStaff)
  .delete(
    middlewareAuth.auth,
    middlewareAuth.isAdmin,
    userController.deleteUser
  );

Router.route("/staff/edit-user")
  .get(middlewareAuth.auth, middlewareAuth.isAdmin, userController.getEditUser)
  .post(middlewareAuth.auth, userController.putUserStaff)
  .put(middlewareAuth.auth, userController.postUserStaff);

// put delete;
module.exports = Router;
