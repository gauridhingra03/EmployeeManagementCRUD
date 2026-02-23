const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

/* =====================
   MongoDB Connection
===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* =====================
   Employee Schema
===================== */
const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["HR", "IT", "Finance", "Marketing", "Sales"],
    },
    designation: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

/* =====================
   API Routes
===================== */

/* ➤ Create Employee */
app.post("/employees", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ➤ Get All Employees */
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ➤ Search Employee (by name or department) */
app.get("/employees/search", async (req, res) => {
  try {
    const { name, department } = req.query;

    const query = {};

    if (name) {
      query.fullName = { $regex: name, $options: "i" };
    }
    if (department) {
      query.department = department;
    }

    const employees = await Employee.find(query);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ➤ Get Employee by ID */
app.get("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ➤ Update Employee */
app.put("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ➤ Delete Employee */
app.delete("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* =====================
   Global Error Handler
===================== */
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

/* =====================
   Server Start
===================== */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});