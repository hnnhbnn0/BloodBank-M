import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    venue: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    barangay: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    date: {
        type: mongoose.Schema.Types.Date,
        required: true,
        unique: true,
    },
    chc: {
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
    bleed: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    screened: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    status: {
        type: mongoose.Schema.Types.String,
        required: false,
        default: "Active",
    },
    bleed: {
        type: mongoose.Schema.Types.String,
        required: false,
    },
    screened: {
        type: mongoose.Schema.Types.String,
        required: false,
    },
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    },
    collection: 'events',
});

const Event = mongoose.model('event', EventSchema);

export default Event;


// {
//     "venue": "Venue 2023",
//     "barangay": "Assumption",
//     "date": {
//       "$date": "2023-01-01T00:00:00.000Z"
//     },
//     "chc": "1",
//     "bloodbank": "Bulacan Blood Center",
//     "status": "Active",
//     "created_at": {
//       "$date": "2023-11-04T04:03:23.996Z"
//     },
//     "updated_at": {
//       "$date": "2023-11-04T04:03:23.996Z"
//     },
//     "__v": 0,
//     "author": {
//       "$oid": "65475336c00be7cee7bd7661"
//     }
//   }