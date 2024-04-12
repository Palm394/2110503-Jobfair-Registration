const Appointment = require("../models/Appointment");
const Company = require("../models/Company");

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments = async (req, res, next) => {
	let query;

	if (req.user.role !== "admin") {
		query = Appointment.find({ user: req.user.id }).populate({
			path: "company",
			select: "name province tel",
		});
	} else {
		if (req.params.companyId) {
			console.log(req.params.companyId);
			query = Appointment.find({ company: req.params.companyId }).populate({
				path: "company",
				select: "name province tel",
			});
		} else {
			query = Appointment.find().populate({
				path: "company",
				select: "name province tel",
			});
		}
	}

	try {
		const appointments = await query;
		res
			.status(200)
			.json({ success: true, count: appointments.length, data: appointments });
	} catch (error) {
		console.log(error.stack);
		return res.status(500).json({
			success: false,
			message: "Cannot find Appointment",
		});
	}
};

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access	Public
exports.getAppointment = async (req, res, next) => {
	try {
		const appointment = await Appointment.findById(req.params.id).populate({
			path: "company",
			select: "name description tel",
		});

		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: `No appointment with the id of ${req.params.id}`,
			});
		}

		res.status(200).json({
			success: true,
			data: appointment,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot find appointment with the id of ${req.params.id}`,
		});
	}
};

//@desc     Add appointment
//@route    POST /api/v1/companys/:companyId/appointments
//@access   Private
exports.addAppointment = async (req, res, next) => {
	try {
		req.body.company = req.params.companyId;

		const company = await Company.findById(req.params.companyId);
		if (!company) {
			return res.status(404).json({
				success: false,
				message: `No company with the id of ${req.params.companyId}`,
			});
		}

		// add user Id to req.body
		req.body.user = req.user.id;

		// Check for existed appointment
		const existedAppointment = await Appointment.find({ user: req.user.id });

		// If the user is not an admin, they can only create 3 appointments
		if (existedAppointment.length >= 3 && req.user.role !== "admin") {
			return res.status(400).json({
				success: false,
				message: `The user with ID ${req.user.id} has already created 3 appointments`,
			});
		}

		const appointment = await Appointment.create(req.body);
		res.status(201).json({
			success: true,
			data: appointment,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot create appointment with the id of ${req.params.companyId}`,
		});
	}
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
	try {
		let appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: `No appointment with the id of ${req.params.id}`,
			});
		}

		if (
			appointment.user.toString() !== req.user.id &&
			req.user.role !== "admin"
		) {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this appointment`,
			});
		}

		appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: appointment,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot update appointment with the id of ${req.params.id}`,
		});
	}
};

//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
	try {
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: `No appointment with the id of ${req.params.id}`,
			});
		}

		if (
			appointment.user.toString() !== req.user.id &&
			req.user.role !== "admin"
		) {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this appointment`,
			});
		}

		await appointment.deleteOne();
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Cannot delete appointment with the id of ${req.params.id}`,
		});
	}
};