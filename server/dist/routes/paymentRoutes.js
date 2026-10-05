"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_js_1 = require("../controllers/paymentController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/demo-checkout', auth_js_1.authenticate, paymentController_js_1.PaymentController.processDemoPayment);
exports.default = router;
