"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const disputeController_js_1 = require("../controllers/disputeController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/', auth_js_1.authenticate, disputeController_js_1.DisputeController.create);
router.get('/me', auth_js_1.authenticate, disputeController_js_1.DisputeController.getMyDisputes);
exports.default = router;
