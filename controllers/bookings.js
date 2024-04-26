const Booking = require("../models/Booking");
const Company = require("../models/Company");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Public
exports.getBookings = async (req, res, next) => {
	let query;

	if (req.user.role !== "admin") {
		query = Booking.find({ user: req.user.id }).populate({
			path: "company",
			select: "name address website description tel",
		});
	} else {
		if (req.params.companyId) {
			console.log(req.params.companyId);
			query = Booking.find({ company: req.params.companyId }).populate({
				path: "company",
				select: "name address website description tel",
			});
		} else {
			query = Booking.find().populate({
				path: "company",
				select: "name address website description tel",
			});
		}
	}

	try {
		const bookings = await query;
		res
			.status(200)
			.json({ success: true, count: bookings.length, data: bookings });
	} catch (error) {
		console.log(error.stack);
		return res.status(500).json({
			success: false,
			message: "Cannot find Booking",
		});
	}
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access	Public
exports.getBooking = async (req, res, next) => {
	try {
		const booking = await Booking.findById(req.params.id).populate({
			path: "company",
			select: "name address website description tel",
		});

		if (!booking) {
			return res.status(404).json({
				success: false,
				message: `No booking with the id of ${req.params.id}`,
			});
		}

		res.status(200).json({
			success: true,
			data: booking,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot find booking with the id of ${req.params.id}`,
		});
	}
};

//@desc     Add booking
//@route    POST /api/v1/companys/:companyId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
	try {
		req.body.company = req.params.companyId;

		const apptDate = new Date(req.body.apptDate);
		console.log(apptDate);

		if (
			apptDate < new Date("2022-05-10") ||
			apptDate >= new Date("2022-05-14")
		) {
			return res.status(400).json({
				success: false,
				message: `Appointment date must be between 10-13 May 2022`,
			});
		}

		const company = await Company.findById(req.params.companyId);
		if (!company) {
			return res.status(404).json({
				success: false,
				message: `No company with the id of ${req.params.companyId}`,
			});
		}

		// add user Id to req.body
		req.body.user = req.user.id;

		// Check for existed booking
		const existedBooking = await Booking.find({ user: req.user.id });

		const existedBookingByCompany = await Booking.find({
			company: req.params.companyId,
		});
		if (existedBookingByCompany.length >= 10 && req.user.role !== "admin") {
			return res.status(400).json({
				success: false,
				message: `The company with ID ${req.params.companyId} has already created 10 bookings`,
			});
		}

		// If the user is not an admin, they can only create 3 bookings
		if (existedBooking.length >= 3 && req.user.role !== "admin") {
			return res.status(400).json({
				success: false,
				message: `The user with ID ${req.user.id} has already created 3 bookings`,
			});
		}

		const booking = await Booking.create(req.body);
		res.status(201).json({
			success: true,
			data: booking,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot create booking with the id of ${req.params.companyId}`,
		});
	}
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
	try {
		let booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res.status(404).json({
				success: false,
				message: `No booking with the id of ${req.params.id}`,
			});
		}

		if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this booking`,
			});
		}

		const apptDate = new Date(req.body.apptDate);
		if (
			apptDate &&
			(apptDate < new Date("2022-05-10") || apptDate >= new Date("2022-05-14"))
		) {
			return res.status(400).json({
				success: false,
				message: `Appointment date must be between 10-13 May 2022`,
			});
		}

		booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: booking,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot update booking with the id of ${req.params.id}`,
		});
	}
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res.status(404).json({
				success: false,
				message: `No booking with the id of ${req.params.id}`,
			});
		}

		if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this booking`,
			});
		}

		await booking.deleteOne();
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot delete booking with the id of ${req.params.id}`,
		});
	}
};
