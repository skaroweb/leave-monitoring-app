const router = require("express").Router();
const { UserModel, validate } = require("../../Common/models/LeaveStatus");

router.post("/createuser", async (req, res) => {
    try {
        const { error } = validate(req.body);

        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const date = await UserModel.findOne({
            name: req.body.name,
            applydate: req.body.applydate,
            currentuserid: req.body.currentuserid,
        });

        if (date && req.body.reason !== "Permission")
            return res.status(409).send({ message: `Apply date already Exist!` });
        const user = req.body;

        const newUser = new UserModel({
            name: req.body.name,
            absencetype: req.body.absencetype,
            reason: req.body.reason,
            permissionTime: req.body.permissionTime,
            workFromHome: req.body.workFromHome,

            // age: req.body.age,
            // userName: req.body.userName,
            currentuserid: req.body.currentuserid,
            status: req.body.status,
            applydate: req.body.applydate,
        });

        await newUser.save();
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
        //console.log(error.message);
    }
});

router.get("/getusers", async (req, res) => {
    try {
        const user = await UserModel.find({});
        res.send(user);
        //console.log(user);
    } catch (err) {
        console.log(err);
    }
});

router.get("/getusers/:id", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        res.send(user);
        //console.log(user);
    } catch (err) {
        console.log(err);
    }
});

router.put("/update/:id", async (req, res) => {
    const date = await UserModel.findOne({
        currentuserid: req.body.currentuserid,
        applydate: req.body.applydate,
        compensation: req.body.compensation,
    });

    // if (date)
    //   return res.status(409).send({ message: `Apply date already Exist!` });

    await UserModel.findByIdAndUpdate(req.params.id, req.body)
        .then((book) => res.json({ msg: "Updated successfully" }))
        .catch((err) =>
            res.status(400).json({ error: "Unable to update the Database" })
        );
});

router.delete("/delete/:id", async (req, res) => {
    await UserModel.findByIdAndDelete(req.params.id)
        .then((book) => res.json({ msg: "deleted successfully" }))
        .catch((err) =>
            res.status(400).json({ error: "Unable to delete the Database" })
        );
});

module.exports = router;
