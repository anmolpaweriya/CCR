"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchingController_js_1 = require("../controllers/matchingController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/assistance/:requestId', auth_js_1.authenticate, matchingController_js_1.MatchingController.getMatchesForRequest);
exports.default = router;
