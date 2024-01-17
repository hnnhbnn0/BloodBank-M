import mongoose from 'mongoose';

const DonorSchema = new mongoose.Schema({
    firstname: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    middlename: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    lastname: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    birthday: {
        type: mongoose.Schema.Types.Date,
        required: true,
    },
    barangay: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    gender: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bloodbank: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bloodtype: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    date: {
        type: mongoose.Schema.Types.Date,
        required: true,
    },
    screened: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bleed: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    bloodbank_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }

}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    },
    collection: 'donors',
});

const Donor = mongoose.model('donors', DonorSchema);

export default Donor;