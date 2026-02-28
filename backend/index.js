

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");   // ✅ IMPORTANT FIX

const authRoute = require("./Routes/AuthRoute");

const HoldingsModel = require("./model/HoldingsModel");
const PositionsModel = require("./model/PositionsModel");
const OrdersModel = require("./model/OrdersModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

/* ================= AUTH ROUTES ================= */

app.use("/", authRoute);

/* ================= HOLDINGS ================= */

app.get("/allHoldings", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json([]);

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;

    const data = await HoldingsModel.find({ id });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.json([]);
  }
});

/* ================= POSITIONS ================= */

app.get("/allPositions", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json([]);

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;

    const data = await PositionsModel.find({ id });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.json([]);
  }
});

/* ================= NEW ORDER ================= */

app.post("/newOrder", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;

    const { name, qty, price, mode, product } = req.body;

    /* ================= SELL VALIDATION FIRST ================= */

    if (product === "MIS") {
      const existingPosition = await PositionsModel.findOne({ id, name });

      if (mode === "SELL") {
        if (!existingPosition || existingPosition.qty < Number(qty)) {
          return res.status(400).json({
            success: false,
            message: "Not enough position to sell"
          });
        }
      }
    }

    if (product === "CNC") {
      const existingHolding = await HoldingsModel.findOne({ id, name });

      if (mode === "SELL") {
        if (!existingHolding || existingHolding.qty < Number(qty)) {
          return res.status(400).json({
            success: false,
            message: "Not enough holdings to sell"
          });
        }
      }
    }

    /* ================= SAVE ORDER AFTER VALIDATION ================= */

    const newOrder = new OrdersModel({
      id,
      name,
      qty,
      price,
      mode,
      product
    });

    await newOrder.save();

    /* ================= MIS LOGIC ================= */

    if (product === "MIS") {
      let existingPosition = await PositionsModel.findOne({ id, name });

      if (mode === "BUY") {
        if (existingPosition) {
          const totalQty = existingPosition.qty + Number(qty);
          const totalCost =
            existingPosition.avg * existingPosition.qty +
            Number(price) * Number(qty);

          existingPosition.qty = totalQty;
          existingPosition.avg = totalCost / totalQty;
          existingPosition.price = Number(price);

          await existingPosition.save();
        } else {
          await PositionsModel.create({
            id,
            name,
            qty: Number(qty),
            avg: Number(price),
            price: Number(price),
            product: "MIS"
          });
        }
      }

      if (mode === "SELL") {
        existingPosition.qty -= Number(qty);
        existingPosition.price = Number(price);

        if (existingPosition.qty === 0) {
          await PositionsModel.deleteOne({ id, name });
        } else {
          await existingPosition.save();
        }
      }
    }

    /* ================= CNC LOGIC ================= */

    if (product === "CNC") {
      let existingHolding = await HoldingsModel.findOne({ id, name });

      if (mode === "BUY") {
        if (existingHolding) {
          const totalQty = existingHolding.qty + Number(qty);
          const totalCost =
            existingHolding.avg * existingHolding.qty +
            Number(price) * Number(qty);

          existingHolding.qty = totalQty;
          existingHolding.avg = totalCost / totalQty;
          existingHolding.price = Number(price);

          await existingHolding.save();
        } else {
          await HoldingsModel.create({
            id,
            name,
            qty: Number(qty),
            avg: Number(price),
            price: Number(price),
            net: "0",
            day: "0"
          });
        }
      }

      if (mode === "SELL") {
        existingHolding.qty -= Number(qty);
        existingHolding.price = Number(price);

        if (existingHolding.qty === 0) {
          await HoldingsModel.deleteOne({ id, name });
        } else {
          await existingHolding.save();
        }
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.log("NEW ORDER ERROR:", error);
    res.status(500).json({ success: false });
  }
});

/* ================= ALL ORDERS ================= */

app.get("/allOrders", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json([]);

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;

    const orders = await OrdersModel.find({ id });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.json([]);
  }
});

/* ================= DB + SERVER ================= */

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));