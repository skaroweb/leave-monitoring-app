const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const Joi = require("joi");
const ObjectId = Schema.Types.ObjectId;

const extraWorkSchema = new Schema(
    {
        name: { type: String, required: true, },
        permissionTime: { type: String, default: "", },
        extraWorkTime: { type: String, required: true, },
        description: { type: String, required: true, },
        status: { type: String, default: "pending", },
        currentuserid: { type: ObjectId, required: true, },
        applydate: { type: Date, required: true, default: Date.now, },
    },
    { timestamps: true, }
);

const ExtraWorkModel = mongoose.model("extrawork", extraWorkSchema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Name"),
        permissionTime: Joi.string().label("Permission Time").allow(null, ""),
        extraWorkTime: Joi.string().required().label("Extra Work Time"),
        description: Joi.string().required().label("Description"),
        currentuserid: Joi.string().required().label("Current User ID"),
        applydate: Joi.date().required().label("Apply Date"),
    });

    return schema.validate(data, { allowUnknown: true });
};

module.exports = { ExtraWorkModel, validate };
