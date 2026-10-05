"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_js_1 = require("../controllers/walletController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/me', auth_js_1.authenticate, walletController_js_1.WalletController.getMyWallet);
router.get('/transactions', auth_js_1.authenticate, walletController_js_1.WalletController.getTransactions);
exports.default = router;
