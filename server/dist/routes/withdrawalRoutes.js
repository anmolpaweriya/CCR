"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawalController_js_1 = require("../controllers/withdrawalController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/request', auth_js_1.authenticate, withdrawalController_js_1.WithdrawalController.requestWithdrawal);
router.get('/me', auth_js_1.authenticate, withdrawalController_js_1.WithdrawalController.getMyWithdrawals);
exports.default = router;
