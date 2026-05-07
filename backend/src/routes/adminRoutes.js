const express = require("express");
const admin = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", admin.getDashboard);
router.get("/requests", admin.getRequests);
router.patch("/requests/:id/status", admin.updateRequestStatus);

router.get("/services", admin.listServices);
router.post("/services", admin.createService);
router.patch("/services/:id", admin.updateService);

router.get("/rates", admin.listRates);
router.post("/rates", admin.createRate);
router.patch("/rates/:id", admin.updateRate);

router.get("/users", admin.listUsers);
router.get("/enquiries", admin.listEnquiries);
router.patch("/users/:id/status", admin.updateUserStatus);

router.get("/settings", admin.getSettings);
router.patch("/settings", admin.updateSettings);

router.get("/blogs", admin.listBlogs);
router.post("/blogs", admin.createBlog);
router.patch("/blogs/:id", admin.updateBlog);
router.delete("/blogs/:id", admin.deleteBlog);

module.exports = router;
