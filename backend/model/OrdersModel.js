const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
  id: String,     
  name: String,
  qty: Number,
  price: Number,
  mode: String,
  product:String
});

const OrdersModel = mongoose.model("Order", OrdersSchema);

module.exports = OrdersModel;