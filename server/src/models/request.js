import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    date: {
        type: mongoose.Schema.Types.Date,
        required: true,
    },
    diagnosis: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bloodtype: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bloodbank: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bloodbank_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: mongoose.Schema.Types.String,
        default: "Pending",
        required: true,
    },
    hospital: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    hospital_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
    collection: "requests",
});

const Request = mongoose.model('requests', RequestSchema);

export default Request;