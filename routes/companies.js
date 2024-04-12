const express = require("express");
const {
	getCompany,
	getCompanies,
	createCompany,
	updateCompany,
	deleteCompany,
} = require("../controllers/companies");

const bookingRouter = require("./bookings");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:companyId/bookings", bookingRouter);

router
	.route("/")
	.get(getCompanies)
	.post(protect, authorize("admin"), createCompany);
router
	.route("/:id")
	.get(getCompany)
	.put(protect, authorize("admin"), updateCompany)
	.delete(protect, authorize("admin"), deleteCompany);

module.exports = router;
