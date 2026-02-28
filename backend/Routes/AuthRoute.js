const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/UserModel");
const auth = require("../middleware/auth");


// ================= SIGNUP =================

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      email,
      username,
      password,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/", // ⭐ important for multi-app
    });

    // Remove password before sending
    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      user: userData,
    });

  } catch (err) {
    console.error("SIGNUP ERROR 👉", err);

    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
});


// ================= LOGIN =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

res.cookie("token", token, {
  httpOnly: true,
  secure: false,        // localhost
  sameSite: "Lax",
  domain: "localhost",  // ⭐ SHARE ACROSS PORTS
  path: "/",            // ⭐ ALL ROUTES
});
    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      user: userData,
    });

  } catch (err) {
    console.error("LOGIN ERROR 👉", err);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});


// ================= AUTH CHECK =================

router.get("/check", auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password");

  res.json({
    success: true,
    user,
  });
});


// ================= LOGOUT =================

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    path: "/", // ⭐ must match login cookie
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});


module.exports = router;