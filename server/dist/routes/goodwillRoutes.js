"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goodwillController_js_1 = require("../controllers/goodwillController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/opportunities', auth_js_1.authenticate, goodwillController_js_1.GoodwillController.getOpportunities);
router.get('/my-history', auth_js_1.authenticate, goodwillController_js_1.GoodwillController.getMyHistory);
exports.default = router;
