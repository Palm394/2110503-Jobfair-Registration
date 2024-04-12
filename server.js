const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const company = require("./routes/company");
const appointments = require("./routes/appointments");
const auth = require("./routes/auth");

dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

const app = express();
app.use(express.json());

app.use("/api/v1/company", company);
app.use("/api/v1/appointments", appointments);
app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 5000;
const server = app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`);
	// Close server & exit process
	server.close(() => process.exit(1));
});
