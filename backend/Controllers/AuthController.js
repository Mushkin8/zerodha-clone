const User = require("../model/UserModel");
const { createSecretToken } = require("../config/SecretToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= SIGNUP =================

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      password,
      username,
    });

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: true,
    });

    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user,
    });

  } catch (error) {
    console.error(error);
  }
};


// ================= LOGIN =================

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success:false, message: "Incorrect email or password" });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ success:false, message: "Incorrect email or password" });
    }

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: true,
    });

    res.json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error(error);
  }
};


// ================= GET CURRENT USER =================

module.exports.GetUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Invalid token",
    });
  }
};


// ================= LOGOUT =================

module.exports.Logout = (req, res) => {
  res.clearCookie("token");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};