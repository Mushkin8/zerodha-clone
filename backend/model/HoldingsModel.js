const mongoose = require("mongoose");

const HoldingsSchema = new mongoose.Schema({
  id:String,
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
});

// ✅ Model name = holdings (plural)
const HoldingsModel = mongoose.model(
  "holdings",
  HoldingsSchema
);

module.exports = HoldingsModel;