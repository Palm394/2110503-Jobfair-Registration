const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			trim: true,
			maxlength: [50, "Name can not be more than 50 characters"],
		},
		address: {
			type: String,
			required: [true, "Please add an address"],
		},
		district: {
			type: String,
			required: [true, "Please add a district"],
		},
		province: {
			type: String,
			required: [true, "Please add a province"],
		},
		postalcode: {
			type: String,
			required: [true, "Please add a postalcode"],
			maxlength: [5, "Postal Code can not be more than 5 digits"],
		},
		tel: {
			type: String,
		},
		region: {
			type: String,
			required: [true, "Please add a region"],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Reverse populate with virtuals
CompanySchema.virtual("appointments", {
	ref: "Appointment",
	localField: "_id",
	foreignField: "company",
	justOne: false,
});

// Cascade delete appointments when a company is deleted
CompanySchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function (next) {
		console.log(`Appointments being removed from company ${this._id}`);
		await this.model("Appointment").deleteMany({ company: this._id });
		next();
	}
);

module.exports = mongoose.model("Company", CompanySchema);
