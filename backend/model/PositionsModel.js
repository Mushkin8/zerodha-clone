const mongoose = require("mongoose");

const PositionsSchema = new mongoose.Schema({
  id: String,
  product: String,
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
});

const PositionsModel = mongoose.model("positions", PositionsSchema);

module.exports = PositionsModel;