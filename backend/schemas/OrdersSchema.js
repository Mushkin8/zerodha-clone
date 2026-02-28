const { Schema } = require("mongoose");
const { useId } = require("react");

const OrdersSchema = new Schema({
  id:String,
  name: String,
  qty: Number,
  price: Number,
  mode: String,
 
});

module.exports = { OrdersSchema };