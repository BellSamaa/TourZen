// server.js
import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
}));

const PORT = process.env.SERVER_PORT || 3001;
const DATA_DIR = path.resolve(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// ensure data dir
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

/**
 * Helper: build VNPay payment URL
 * See VNPay docs. We compute vnp_SecureHash using hmacSHA512 of sorted params.
 */
function sortObject(obj) {
  return Object.keys(obj).sort().reduce((res, key) => {
    res[key] = obj[key];
    return res;
  }, {});
}

function hmacSHA512(secret, data) {
  return crypto.createHmac("sha512", secret).update(data).digest("hex");
}

app.post("/api/vnpay/create_payment", (req, res) => {
  try {
    // Expect from frontend: { amount, orderInfo, orderType, bankCode, locale, returnUrl (optional) }
    const body = req.body || {};
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || "2QXUI4J4";
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SECRETKEY";
    const vnp_Url = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = body.returnUrl || process.env.VNPAY_RETURN_URL || `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/payment/success`;

    // generate unique order id & txn ref
    const createDate = new Date();
    const orderId = `ORD${Date.now()}`;
    const vnp_TxnRef = `${orderId}`;

    // amount VNPay expects in smallest unit (VND * 100) — many implementations multiply by 100
    // We'll accept frontend amount in VND and multiply by 100.
    const amountVnd = Number(body.amount || 0);
    const vnp_Amount = String(amountVnd * 100);

    // standard payment params
    const ipAddr = req.ip || req.connection?.remoteAddress || "127.0.0.1";

    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: vnp_Amount,
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: body.orderInfo || `Thanh toan ${orderId}`,
      vnp_OrderType: body.orderType || "other",
      vnp_Locale: body.locale || "vn",
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 14),
    };

    if (body.bankCode) vnpParams.vnp_BankCode = body.bankCode;

    // sort and build query string
    const sorted = sortObject(vnpParams);
    const signData = Object.keys(sorted).map(k => `${k}=${sorted[k]}`).join("&");
    const vnp_SecureHash = hmacSHA512(vnp_HashSecret, signData);

    const query = Object.keys(sorted).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(sorted[k])}`).join("&")
      + `&vnp_SecureHash=${vnp_SecureHash}`;

    const paymentUrl = `${vnp_Url}?${query}`;

    // Save draft order locally
    const order = {
      orderId,
      txnRef: vnp_TxnRef,
      amount: amountVnd,
      createdAt: new Date().toISOString(),
      info: body.orderInfo || null,
      status: "PENDING",
    };
    saveOrder(order);

    return res.json({ success: true, orderId, paymentUrl, txnRef: vnp_TxnRef });
  } catch (err) {
    console.error("create_payment error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * VNPay will redirect user back to vnp_ReturnUrl with a bunch of query params like:
 *  vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_SecureHash, ...
 * We validate secure hash here and update local order status.
 */
app.get("/api/vnpay/return", (req, res) => {
  try {
    const query = req.query || {};
    // grab secure hash, then remove it from params to compute our own
    const vnp_SecureHash = query.vnp_SecureHash;
    // copy and remove vnp_SecureHash & vnp_SecureHashType
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sorted = sortObject(params);
    const signData = Object.keys(sorted).map(k => `${k}=${sorted[k]}`).join("&");
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SECRETKEY";

    const hashVerify = hmacSHA512(vnp_HashSecret, signData);

    const txnRef = query.vnp_TxnRef;
    const respCode = query.vnp_ResponseCode;

    // find order and update
    const orders = readOrders();
    const idx = orders.findIndex(o => o.txnRef === txnRef || o.orderId === txnRef);
    if (idx !== -1) {
      orders[idx].vnp_ResponseCode = respCode;
      orders[idx].vnpData = query;
      orders[idx].status = (respCode === "00" && hashVerify === vnp_SecureHash) ? "PAID" : "FAILED";
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
    }

    // redirect to frontend success/fail
    if (hashVerify === vnp_SecureHash && respCode === "00") {
      // success
      const frontendSuccess = process.env.FRONTEND_ORIGIN ? (process.env.FRONTEND_ORIGIN + "/payment/success") : "/payment/success";
      // attach txnRef
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

// Optional: list orders (admin)
app.get("/api/orders", (req, res) => {
  const orders = readOrders();
  res.json({ success: true, orders });
});

// Start
app.listen(PORT, () => {
  console.log(`VNPay demo server running on http://localhost:${PORT}`);
});
