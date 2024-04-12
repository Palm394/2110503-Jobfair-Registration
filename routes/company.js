const express = require("express");
const {
	getCompany,
	getCompanys,
	createCompany,
	updateCompany,
	deleteCompany,
} = require("../controllers/company");

const appointmentRouter = require("./appointments");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:companyId/appointments", appointmentRouter);

router
	.route("/")
	.get(getCompanys)
	.post(protect, authorize("admin"), createCompany);
router
	.route("/:id")
	.get(getCompany)
	.put(protect, authorize("admin"), updateCompany)
	.delete(protect, authorize("admin"), deleteCompany);

module.exports = router;
