const Company = require("../models/Company");

//@desc     Get all company
//@route    GET /api/v1/company
//@access   Public
exports.getCompanys = async (req, res, next) => {
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };
	console.log(reqQuery);
	// Fields to exclude
	const removeField = ["select", "sort", "page", "limit"];

	// Loop over removeFields and delete them from reqQuery
	removeField.forEach((param) => delete reqQuery[param]);
	console.log(reqQuery);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	query = Company.find(JSON.parse(queryStr)).populate("appointments");

	// Select Fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	try {
		const total = await Company.countDocuments();
		query = query.skip(startIndex).limit(limit);

		// Execute query
		const company = await query;

		// Pagination result
		const pagination = {};

		if (endIndex < total) {
			pagination.next = {
				page: page + 1,
				limit,
			};
		}

		if (startIndex > 0) {
			pagination.prev = {
				page: page - 1,
				limit,
			};
		}

		res.status(200).json({
			success: true,
			count: company.length,
			pagination,
			data: company,
		});
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

//@desc     Get single company
//@route    GET /api/v1/company/:id
//@access   Public
exports.getCompany = async (req, res, next) => {
	try {
		const company = await Company.findById(req.params.id);
		if (!company) {
			return res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: company });
	} catch {
		res.status(400).json({ success: false });
	}
};

//@desc     Create new company
//@route    POST /api/v1/company
//@access   Private
exports.createCompany = async (req, res, next) => {
	const company = await Company.create(req.body);
	res.status(201).json({ success: true, data: company });
};

//@desc     Update company
//@route    PUT /api/v1/company/:id
//@access   Private
exports.updateCompany = async (req, res, next) => {
	try {
		const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!company) {
			return res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: company });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Delete company
//@route    DELETE /api/v1/company/:id
//@access   Private
exports.deleteCompany = async (req, res, next) => {
	try {
		const company = await Company.findById(req.params.id);
		if (!company) {
			return res.status(400).json({ success: false });
		}
		await company.deleteOne();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		console.log(err.stack);
		res.status(400).json({ success: false });
	}
};
