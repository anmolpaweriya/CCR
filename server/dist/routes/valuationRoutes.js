"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const valuationController_js_1 = require("../controllers/valuationController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/assistance', auth_js_1.authenticate, valuationController_js_1.ValuationController.evaluateAssistance);
router.post('/resource', auth_js_1.authenticate, valuationController_js_1.ValuationController.evaluateResource);
exports.default = router;
