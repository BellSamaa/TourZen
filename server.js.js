import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
}));

const PORT = process.env.SERVER_PORT || 3001;
const DATA_DIR = path.resolve(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// --- MongoDB setup for users ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tourzen";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  facebookId: String,
});

const User = mongoose.model("User", userSchema);

// --- JWT helper ---
const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "1d" });

// --- ensure data dir ---
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf8");

function saveOrder(order) {
  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  const arr = JSON.parse(raw || "[]");
  arr.unshift(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2), "utf8");
}
function readOrders() {
  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

// --- VNPay helpers ---
function sortObject(obj) {
  return Object.keys(obj).sort().reduce((res, key) => { res[key] = obj[key]; return res; }, {});
}
function hmacSHA512(secret, data) {
  return crypto.createHmac("sha512", secret).update(data).digest("hex");
}

// ----------------------------
// Authentication routes
// ----------------------------

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

  try {
    const exist = await User.findOne({ email });
    if (exist) return res.json({ success: false, message: "Email đã tồn tại" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();

    const token = generateToken(user);
    return res.json({ success: true, message: "Đăng ký thành công", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Lỗi server" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Mật khẩu sai" });

    const token = generateToken(user);
    return res.json({ success: true, message: "Đăng nhập thành công", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Lỗi server" });
  }
});

// Facebook login
app.post("/api/login/facebook", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.json({ success: false, message: "Access token required" });

  try {
    const fbRes = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
    const { id, email, name } = fbRes.data;

    let user = await User.findOne({ facebookId: id });
    if (!user) {
      user = new User({ facebookId: id, name, email });
      await user.save();
    }

    const token = generateToken(user);
    return res.json({ success: true, message: "Facebook login thành công", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.response?.data || err);
    return res.json({ success: false, message: "Facebook login thất bại" });
  }
});

// Middleware: verify JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Token required" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

// ----------------------------
// VNPay routes (unchanged)
// ----------------------------
// ----------------------------
// VNPay routes (original)
// ----------------------------

app.post("/api/vnpay/create_payment", (req, res) => {
  try {
    const body = req.body || {};
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || "2QXUI4J4";
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SECRETKEY";
    const vnp_Url = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = body.returnUrl || process.env.VNPAY_RETURN_URL || `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/payment/success`;

    const createDate = new Date();
    const orderId = `ORD${Date.now()}`;
    const vnp_TxnRef = `${orderId}`;
    const amountVnd = Number(body.amount || 0);
    const vnp_Amount = String(amountVnd * 100);
    const ipAddr = req.ip || req.connection?.remoteAddress || "127.0.0.1";

    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount,
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo: body.orderInfo || `Thanh toan ${orderId}`,
      vnp_OrderType: body.orderType || "other",
      vnp_Locale: body.locale || "vn",
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 14),
    };
    if (body.bankCode) vnpParams.vnp_BankCode = body.bankCode;

    const sorted = sortObject(vnpParams);
    const signData = Object.keys(sorted).map(k => `${k}=${sorted[k]}`).join("&");
    const vnp_SecureHash = hmacSHA512(vnp_HashSecret, signData);

    const query = Object.keys(sorted).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(sorted[k])}`).join("&")
      + `&vnp_SecureHash=${vnp_SecureHash}`;
    const paymentUrl = `${vnp_Url}?${query}`;

    const order = {
      orderId,
      txnRef: vnp_TxnRef,
      amount: amountVnd,
      createdAt: new Date().toISOString(),
      info: body.orderInfo || null,
      status: "PENDING",
      user: req.user?.id || null, // link order to logged-in user
    };
    saveOrder(order);

    return res.json({ success: true, orderId, paymentUrl, txnRef: vnp_TxnRef });
  } catch (err) {
    console.error("create_payment error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/vnpay/return", (req, res) => {
  try {
    const query = req.query || {};
    const vnp_SecureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sorted = sortObject(params);
    const signData = Object.keys(sorted).map(k => `${k}=${sorted[k]}`).join("&");
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SECRETKEY";

    const hashVerify = hmacSHA512(vnp_HashSecret, signData);

    const txnRef = query.vnp_TxnRef;
    const respCode = query.vnp_ResponseCode;

    const orders = readOrders();
    const idx = orders.findIndex(o => o.txnRef === txnRef || o.orderId === txnRef);
    if (idx !== -1) {
      orders[idx].vnp_ResponseCode = respCode;
      orders[idx].vnpData = query;
      orders[idx].status = (respCode === "00" && hashVerify === vnp_SecureHash) ? "PAID" : "FAILED";
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
    }

    if (hashVerify === vnp_SecureHash && respCode === "00") {
      const frontendSuccess = process.env.FRONTEND_ORIGIN ? (process.env.FRONTEND_ORIGIN + "/payment/success") : "/payment/success";
      const url = `${frontendSuccess}?vnp_TxnRef=${encodeURIComponent(txnRef)}&vnp_Amount=${encodeURIComponent(query.vnp_Amount)}&vnp_ResponseCode=${encodeURIComponent(respCode)}`;
      return res.redirect(url);
    } else {
      const frontendFail = process.env.FRONTEND_ORIGIN ? (process.env.FRONTEND_ORIGIN + "/payment/fail") : "/payment/fail";
      const url = `${frontendFail}?vnp_TxnRef=${encodeURIComponent(txnRef)}&vnp_ResponseCode=${encodeURIComponent(respCode)}`;
      return res.redirect(url);
    }
  } catch (err) {
    console.error("vnpay return error", err);
    return res.status(500).send("Error processing VNPay return");
  }
});

// (Giữ nguyên toàn bộ route VNPay và /api/orders như gốc)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
