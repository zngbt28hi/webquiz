const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../model/userModel");
const nodemailer = require("nodemailer");
const tokenModel = require("../model/tokenModel");
const { SECRET_KET } = require("../../constant");
const userApproveModel = require("../model/userModelApprove");
const mailModal = require("../model/mailModal");

exports.postStaff = async (req, res) => {
  try {
    let { name, userName, mail, phone, address } = req.body;
    const newUser = new UserModel({
      user: name,
      userName,
      password: "123456",
      mail,
      role: "staff",
      phone,
      address,
      active: false,
      status: "pending",
    });
    let result = await newUser.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.postUser = async (req, res) => {
  try {
    let { name, userName, mail, phone, address } = req.body;
    const newUser = new UserModel({
      user: name,
      userName,
      password: "123456",
      mail,
      role: "user",
      phone,
      address,
      active: false,
      status: "pending",
    });
    let result = await newUser.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.regester = async (req, res) => {
  try {
    let {
      fisrtName,
      lastName,
      userName,
      password,
      mail,
      phone,
      address,
      role,
    } = req.body;
    const newUser = new UserModel({
      user: fisrtName + " " + lastName,
      userName,
      password,
      mail,
      role,
      phone,
      address,
      active: false,
      status: "pending",
    });
    let result = await newUser.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.authorization = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "not token" });
    }

    let data = jwt.verify(token, SECRET_KET);
    if (!data) {
      return res.status(401).json({ message: "token wrong" });
    }

    let user = await UserModel.findOne(
      { userName: data.userName },
      { _id: 0, password: 0, __v: 0 }
    );

    if (!user) {
      return res.status(401).json({ message: "token wrong" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await UserModel.findAccount(userName, password);
    const token = await user.generateToken();
    if (!user) {
      res.json({ message: "account not found" });
    }
    let userRes = await UserModel.findOne(
      { userName: userName },
      { _id: 0, password: 0, __v: 0 }
    );
    res.cookie(`token`, token, {
      httpOnly: true,
      path: "",
      expire: new Date(Date.now() + 7 * 60 * 60 * 1000),
      maxAge: 7 * 60 * 60 * 1000,
    });
    res.json({ message: "login success", user: userRes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.setCookie = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      path: "",
      maxAge: 0,
      expires: new Date(Date.now()),
    });
    res.status(200).json({ message: "logout success " });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;
    let data = jwt.verify(token, SECRET_KET);
    const user = await UserModel.findOne({ userName: data.userName });
    const tokenSave = await tokenModel.findOne({ token: token });
    if (!user) {
      throw new Error("user not exist");
    }
    if (!tokenSave) {
      throw new Error("invalid token");
    }
    if (tokenSave.isUsed) {
      throw new Error("token is used");
    }

    user.password = password;
    tokenSave.isUsed = true;
    await user.save();
    await tokenSave.save();

    res.status(201).json({ message: "Reset password success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, password, userName } = req.body;
    const user = await UserModel.findOne({ userName });
    if (!user) {
      throw new Error("user not exits");
    }
    const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isMatchPassword) {
      throw new Error("password not match !!!");
    }
    user.password = password;
    await user.save();
    res.status(201).json({ message: "change password success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setCookie = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { mail } = req.body;
    let user = await UserModel.findOne({ mail });
    if (!user) {
      throw new Error("user not exist");
    }
    const token = await user.generateToken();

    const newToken = new tokenModel({
      token,
      userID: user._id,
      isUsed: false,
    });
    let result = await newToken.save();
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "giangbui.las123@gmail.com",
        pass: "tbtp ivfw rwle egdf",
      },
    });
    if (result) {
      var mainOptions = {
        // thiết lập đối tượng, nội dung gửi mail
        from: "BUIGIANG",
        to: mail,
        subject: "Quên Mật Khẩu",
        text: "You recieved message from " + req.body.email,
        html:
          "<p>Vui Lòng nhấp theo đường </p>" +
          ` <a
              href="http://localhost:3000/reset-password?token=${token}"
              target={"_blank"}
              rel="noopener noreferrer"
              >
              Click here
              </a>`,
      };
      transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
          res.json({ message: err.message, error: true });
        } else {
          res.json({ message: "send mail success" });
        }
      });
    } else {
      throw new Error("error");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.termAdmin = async (req, res) => {
  let { userName } = req.body;
  try {
    let user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.json({ message: "find account not found by user name" });
    }
    user.role = "admin";
    let newUser = await user.save();
    res.json({ message: "change role to admin success", newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    const searh = {
      status,
      role: "user",
    };
    if (keyword) {
      searh["user"] = { $regex: keyword };
    }
    let listUser = await UserModel.find({ ...searh }, { password: 0, __v: 0 });
    res.json({ users: listUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getUserActive = async (req, res) => {
  try {
    const { idSurvey } = req.query;

    let listUser = await UserModel.find(
      { active: true },
      { password: 0, __v: 0 }
    );

    let listMail = await mailModal.find({ surveyID: idSurvey });

    const data = listUser.filter((user) => {
      let isValid = true;
      listMail.map((mail) => {
        if (mail.mail == user.mail) {
          isValid = false;
        }
      });
      return isValid;
    });
    res.json({ users: data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getStaff = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    const searh = {
      status,
      role: "staff",
    };
    if (keyword) {
      searh["user"] = { $regex: keyword };
    }
    let listUser = await UserModel.find({ ...searh }, { password: 0, __v: 0 });
    res.json({ users: listUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getEditUser = async (req, res) => {
  try {
    const { status } = req.query;
    let listUser = await userApproveModel.find(
      { approve: status },
      { password: 0, __v: 0 }
    );
    res.json({ users: listUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.postUserStaff = async (req, res) => {
  try {
    const { status, id, userName } = req.body;

    let user = await userApproveModel.findOne({ _id: id });

    if (!user) {
      res.json("something wrong");
    }
    if (status == "reject") {
      user.approve = "reject";
      const newUser = await user.save();
      res.json({ message: "success", newUser });
    }
    if (status == "accept") {
      const userReal = await UserModel.findOne({ userName });
      if (!userReal) {
        res.json("something wrong");
      }
      userReal.phone = user.phone;
      userReal.mail = user.mail;
      userReal.address = user.address;
      userReal.user = user.user;
      await userReal.save();

      user.approve = "accept";
      const newUser = await user.save();

      res.json({ message: "success", newUser });
    }
    res.json({ users: listUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userName } = req.body;
    let user = await UserModel.find({ userName: userName });
    await user.delete();
    res.json({ message: "delete account success" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.putUser = async (req, res) => {
  try {
    const { phone, userName, password, mail, address, status, active, name } =
      req.body;

    let user = await UserModel.findOne({ userName: userName });

    user.phone = phone || user.phone;
    user.userName = userName || user.userName;
    user.password = password || user.password;
    user.user = name || user.user;
    user.mail = mail || user.mail;
    user.address = address || user.address;
    user.status = status || user.status;
    user.active = active === undefined ? user.active : active;

    let newUser = await user.save();
    res.json({ newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.putUserStaff = async (req, res) => {
  try {
    const { phone, userName, mail, address, name } = req.body;

    let user = await UserModel.findOne({ userName: userName });

    if (!user) {
      res.json({ message: "user not exist" });
    }

    const userApprove = new userApproveModel({
      user: name,
      mail,
      phone,
      address,
      userName,
    });

    let newUser = await userApprove.save();
    res.json({ newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.putStaff = async (req, res) => {
  try {
    const { phone, userName, password, mail, address, status, active } =
      req.body;

    let user = await UserModel.findOne({ userName: userName });

    user.phone = phone || user.phone;
    user.userName = userName || user.userName;
    user.password = password || user.password;
    user.mail = mail || user.mail;
    user.address = address || user.address;
    user.status = status || user.status;
    user.active = active === undefined ? user.active : active;

    let newUser = await user.save();
    res.json({ newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
