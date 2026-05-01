const express = require("express");
const { createRequest, listMyRequests, getMyRequestById } = require("../controllers/requestController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("user"));
router.get("/", listMyRequests);
router.post("/", createRequest);
router.get("/:id", getMyRequestById);

module.exports = router;

