import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    fullname: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    // username: {
    //     type: mongoose.Schema.Types.String,
    //     required: true,
    //     unique: true,
    // },
    password: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true,
    },
    contact: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    otp: {
        type: mongoose.Schema.Types.String,
        required: true,
        default: () => Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
    },
    affiliation: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: false,
    },
    is_2fa: {
        type: mongoose.Schema.Types.Boolean,
        required: false,
        default: true,
    },
    status: {
        type: mongoose.Schema.Types.String,
        required: false,
        default: "Active",
    },
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    },
    collection: 'users',
});

const User = mongoose.model('users', UserSchema);

export default User;