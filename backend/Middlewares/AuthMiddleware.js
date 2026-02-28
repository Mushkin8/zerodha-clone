

const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

module.exports.userVerification = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ status: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.json({ status: false });
    }

    return res.json({
      status: true,
      user: user.username,   // ⭐ RETURN USERNAME
    });

  } catch (error) {
    return res.json({ status: false });
  }
};