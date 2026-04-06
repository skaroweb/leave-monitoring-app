const router = require("express").Router();
const { ExtraWorkModel, validate } = require("../../Common/models/ExtraWork");
const { employeeinfoModel } = require("../../Common/models/Employeeinfo");

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

router.post("/create", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const newExtraWork = new ExtraWorkModel({
            name: req.body.name,
            permissionTime: req.body.permissionTime,
            extraWorkTime: req.body.extraWorkTime,
            description: req.body.description,
            currentuserid: req.body.currentuserid,
            applydate: req.body.applydate,
            status: "pending",
        });

        // The logic to add permission time to overall permission time
        // should ideally happen now or on approval?
        // "The Permission Time entered by the employee should be added to the overall permission time."
        // Let's add it immediately or on approval? Let's add it on approval so rejections cancel it out.

        await newExtraWork.save();
        res.json(newExtraWork);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.get("/all", async (req, res) => {
    try {
        const extraWorkList = await ExtraWorkModel.find({}).sort({ createdAt: -1 });
        res.send(extraWorkList);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server error" });
    }
});


// balance work time calculation

router.get("/balances", async (req, res) => {
    try {
        const { UserModel } = require("../../Common/models/LeaveStatus");
        const { employeeinfoModel } = require("../../Common/models/Employeeinfo");

        // Get all users
        const employees = await employeeinfoModel.find({});

        // Get approved permissions and extraworks
        const approvedPermissions = await UserModel.find({ status: "approve", permissionTime: { $exists: true, $ne: "" } });
        const approvedExtraWorks = await ExtraWorkModel.find({ status: "approve", extraWorkTime: { $exists: true, $ne: "" } });

        // Helper to convert "HH:MM" to minutes
        function timeToMinutes(timeStr) {
            if (!timeStr) return 0;
            const parts = String(timeStr).split(":");
            return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
        }

        // Helper to convert minutes to "HH:MM"
        function minutesToTime(mins) {
            if (mins === undefined || mins === null || mins === "" || isNaN(mins) || mins <= 0) {
                return "00:00";
            }
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }

        const balances = employees.map(emp => {
            const empId = emp._id.toString();

            // Total debit: Permission Time
            const empPerms = approvedPermissions.filter(p => p.currentuserid && p.currentuserid.toString() === empId);
            const totalDebit = empPerms.reduce((acc, curr) => acc + timeToMinutes(curr.permissionTime), 0);

            // Total credit: Extra Work Time
            const empExtras = approvedExtraWorks.filter(e => e.currentuserid && e.currentuserid.toString() === empId);
            const totalCredit = empExtras.reduce((acc, curr) => acc + timeToMinutes(curr.extraWorkTime), 0);

            let remainingPermission = 0;
            let remainingExtraWork = 0;

            if (totalDebit > totalCredit) {
                remainingPermission = totalDebit - totalCredit;
            } else if (totalCredit > totalDebit) {
                remainingExtraWork = totalCredit - totalDebit;
            }

            return {
                _id: emp._id,
                name: emp.name,
                totalDebit,
                totalCredit,
                remainingPermission: minutesToTime(remainingPermission),
                remainingExtraWork: minutesToTime(remainingExtraWork)
            };
        });

        res.status(200).json(balances);
    } catch (err) {
        console.error("Error calculating balances:", err);
        res.status(500).send({ message: "Server error" });
    }
});

router.put("/update/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const extrawork = await ExtraWorkModel.findById(req.params.id);
        if (!extrawork) return res.status(404).send({ message: "Extra work not found" });

        // Ensure we only process calculations once
        if (extrawork.status !== "approve" && status === "approve") {
            const employee = await employeeinfoModel.findById(extrawork.currentuserid);
            if (employee) {
                let permMin = timeToMinutes(extrawork.permissionTime);
                let extraMin = timeToMinutes(extrawork.extraWorkTime);

                // Add requested permission time to the overall permission time
                let availablePerm = (employee.availablePermissionTime || 0) + permMin;
                let availableExtra = employee.availableExtraWorkTime || 0;

                // Reduce extra work time from permission time if it exists
                if (availablePerm >= extraMin) {
                    availablePerm -= extraMin;
                } else {
                    // Remaining extra work time after deducting permission time
                    let remainingExtra = extraMin - availablePerm;
                    availablePerm = 0;
                    // Balance added to employee extra work time
                    availableExtra += remainingExtra;
                }

                employee.availablePermissionTime = availablePerm;
                employee.availableExtraWorkTime = availableExtra;
                await employee.save();
            }
        }

        extrawork.status = status;
        await extrawork.save();

        res.json({ message: "Updated successfully", extrawork });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
