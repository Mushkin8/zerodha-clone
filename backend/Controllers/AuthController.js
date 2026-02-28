


const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

/* ===========================
   SIGNUP
=========================== */

module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }

    const user = await User.create({
      email,
      password,
      username,
      createdAt: new Date(),
    });

    const token = createSecretToken(user._id);

    // ✅ FIXED COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // keep false for localhost
    });

    return res.status(201).json({
      message: "User signed up successfully",
      success: true,
      user: user._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


/* ===========================
   LOGIN
=========================== */

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const token = createSecretToken(user._id);

    // ✅ FIXED COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // localhost only
    });

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: user._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


/* ===========================
   LOGOUT
=========================== */

module.exports.Logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      message: "User logged out successfully",
      success: true,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};