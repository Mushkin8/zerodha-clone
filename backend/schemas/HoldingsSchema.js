const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema({
    id:String,
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: Number,
  day: Number
});

module.exports = { HoldingSchema };
