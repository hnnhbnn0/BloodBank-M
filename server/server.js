import bcrypt from "bcrypt";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import http from './src/config/http.js';
import dateFormat from './src/helpers/dateformat.js';
import dotenv from './src/helpers/dotenv.js';
import forecasting from './src/helpers/forecast.js';
import mailer from "./src/helpers/mailer.js";
import mongo from './src/helpers/mongo.js';
import replacewords from './src/helpers/replacewords.js';
import trend from './src/helpers/trend.js';
import Donor from './src/models/donor.js';
import Event from './src/models/event.js';
import Request from './src/models/request.js';
import User from './src/models/users.js';

dotenv.connect();
mongo.connect();

const server = express();
const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));

server.use(express.json({ limit: "500kb" }));
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(cors({
    origin: [
        'https://blood-donation-forecasting.site',
        'https://blood-donation-client-eight.vercel.app',
        // 'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

server.get("/api/v/user", (req, res) => {

    const { key } = req.query;

    if (!key) {
        return res.json({ message: "Missing api key.", verified: false });
    }

    const user = jwt.verify(key, process.env.JWT_SECRET_KEY);

    if (!user && !User.find({ _id: user.id, email: user.email, created_at: user.created_at, status: "Active" })) {
        return res.json({ message: "Invalid api key.", verified: false });
    }

    return res.json({
        verified: true,
        id: user.id,
        name: user.name,
        email: user.email,
        position: user.position,
    });
});


server.get("/files/template/:file", (req, res) => {
    const { file } = req.params;
    const filepath = path.join(__dirname, `/src/assets/templates/${file}.xlsx`);

    res.download(filepath, (err) => {
        if (err) {
            res.status(500).json({ message: `Error downloading the file \`${file}\``, error: err.message });
        }
    });

});

server.get("/api/:category/:subcategory/:item", async (req, res) => {
    try {
        const { category, subcategory, item } = req.params;
        const { type, bloodbank_id, hospital_id } = req.query;
        const ObjectId = (data) => new mongoose.Types.ObjectId(data);
        const { page, limit, search, timeframe } = req.query;
        const date = new Date();
        const currentYear = date.getFullYear();
        const previousYear = currentYear - 1;
        // const today = new Date(Date.now());
        let query, Model;

        var labels, datasets;

        var header, body, data, total, protect;

        var queryCurrent, queryPrevious, queryOverall;

        const secondary = [subcategory.toLowerCase(), item.toLowerCase()].join("-");

        const strictSearch = ["date", "quantity", "birthday", "created_at", "modified_at"];
        switch (category) {
            case "q":
                switch (secondary) {
                    case "bloodbank-list":
                        return User.aggregate([
                            {
                                $match: {
                                    status: "Active",
                                    "role": "bloodbank",
                                },
                            },
                            {
                                $project: {
                                    _id: 1,
                                    affiliation: 1,
                                    fullname: 1,
                                    email: 1,
                                }
                            }
                        ])
                            .then(result => res.json({ result }))
                            .catch(err => {
                                console.error('Error during aggregation:', err);
                                res.status(500).json({ error: 'An error occurred listing bloodbanks', error: err.message });
                            });
                }
                return
            case "g":
                switch (secondary) {
                    case "event-schedule":
                        Model = Event;
                        header = [
                            { key: "date", label: "Date", type: "date", options: { view: 1, edit: 1 } },
                            { key: "venue", label: "Venue", options: { view: 1, edit: 1 } },
                            { key: "chc", label: "CHC", options: { view: 1, edit: 1 } },
                            { key: "barangay", label: "Barangay", options: { view: 1 } },
                            { key: "bloodbank", label: "Bloodbank", options: { view: 1, edit: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } },
                        ];
                        protect = ["author", "created_at", "updated_at", "__v"];
                        query = {
                            status: "Active",
                            date: {
                                $gte: new Date(Date.now()),
                            },
                            ...(timeframe ? {
                                date: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "event-result":
                        Model = Event;
                        header = [
                            { key: "date", label: "Event Date", type: "date", options: { view: 1 } },
                            { key: "venue", label: "Event Venue", options: { view: 1 } },
                            { key: "bloodbank", label: "Bloodbank", options: { view: 1 } },
                            { key: "chc", label: "CHC", options: { view: 1 } },
                            { key: "barangay", label: "Barangay", options: { view: 1 } },
                            { key: "screened", label: "Screened", options: { view: 1 } },
                            { key: "bleed", label: "Bleed", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1, strict: 1 } },
                        ];
                        protect = ["author", "created_at", "updated_at", "__v"];
                        query = {
                            status: "Active",
                            date: {
                                $lte: new Date(Date.now()),
                            },
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            ...(timeframe ? {
                                date: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "request-pending":
                        Model = Request;
                        header = [
                            { key: "created_at", label: "Date Submitted", options: { view: 1 } },
                            { key: "date", label: "Requested Date", type: "date", options: { view: 1 } },
                            { key: "patient", label: "Patient", options: { view: 1 } },
                            { key: "hospital", label: "Hospital", options: { view: 1 } },
                            // { key: "quantity", label: "Quantity", type: "number", options: { view: 1 } },
                            { key: "diagnosis", label: "Diagnosis", options: { view: 1 } },
                            { key: "bloodtype", label: "Bloodtype", options: { view: 1 } },
                            { key: "bloodbank", label: "Bloodbank", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } },
                        ];
                        protect = ["updated_at", "__v"];
                        query = {
                            status: "Pending",
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "request-approved":
                        Model = Request;
                        header = [
                            { key: "created_at", label: "Date Submitted", options: { view: 1 } },
                            { key: "date", label: "Requested Date", type: "date", options: { view: 1 } },
                            { key: "patient", label: "Patient", options: { view: 1 } },
                            { key: "hospital", label: "Hospital", options: { view: 1 } },
                            // { key: "quantity", label: "Quantity", type: "number", options: { view: 1, edit: 1 } },
                            { key: "diagnosis", label: "Diagnosis", options: { view: 1 } },
                            { key: "bloodtype", label: "Bloodtype", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } },
                        ];
                        protect = ["_id", "updated_at", "__v"];
                        query = {
                            status: "Approved",
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "request-rejected":
                        Model = Request;
                        header = [
                            { key: "created_at", label: "Date Submitted", options: { view: 1 } },
                            { key: "date", label: "Requested Date", type: "date", options: { view: 1 } },
                            { key: "patient", label: "Patient", options: { view: 1 } },
                            { key: "hospital", label: "Hospital", options: { view: 1 } },
                            // { key: "quantity", label: "Quantity", type: "number", options: { view: 1, edit: 1 } },
                            { key: "diagnosis", label: "Diagnosis", options: { view: 1 } },
                            { key: "bloodtype", label: "Bloodtype", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } },
                        ];
                        protect = ["_id", "updated_at", "__v"];
                        query = {
                            status: "Declined",
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "request-report":
                        Model = Request;
                        header = [
                            { key: "created_at", label: "Date Submitted", options: { view: 1 } },
                            { key: "date", label: "Requested Date", type: "date", options: { view: 1 } },
                            { key: "patient", label: "Patient", options: { view: 1 } },
                            { key: "hospital", label: "Hospital", options: { view: 1 } },
                            // { key: "quantity", label: "Quantity", type: "number", options: { view: 1, edit: 1 } },
                            { key: "diagnosis", label: "Diagnosis", options: { view: 1 } },
                            { key: "bloodtype", label: "Bloodtype", options: { view: 1 } },
                            { key: "bloodbank", label: "Bloodbank", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } },
                        ];
                        protect = ["_id", "updated_at", "__v"];
                        query = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                            status: {
                                $ne: "Pending"
                            }
                        };
                        break;
                    case "donor-list":
                        header = [
                            { key: "fullname", label: "Full Name", options: { view: 0 } },
                            { key: "firstname", label: "First Name", options: { view: 1 } },
                            { key: "middlename", label: "Middle Name", options: { view: 1 } },
                            { key: "lastname", label: "Last Name", options: { view: 1 } },
                            { key: "birthday", label: "Birthday", options: { view: 1 } },
                            { key: "gender", label: "Gender", options: { view: 1, edit: 1 } },
                            { key: "bloodtype", label: "Bloodtype", options: { view: 1 } },
                            { key: "donated", label: "Donate Count", options: { view: 1 } },
                        ];
                        const [result, records] = await Promise.all([
                            Donor.aggregate([
                                {
                                    $match: {
                                        bleed: "Yes",
                                        ...(timeframe ? {
                                            date: {
                                                $gte: new Date(Number(timeframe.split("-")[0])),
                                                $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                            }
                                        } : {}),
                                        ...(search ? {
                                            $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                                [key]: {
                                                    $regex: new RegExp(search, 'i'),
                                                },
                                            }))
                                        } : {}),
                                    }
                                },
                                {
                                    $project: {
                                        fullname: { $concat: ["$firstname", " ", "$lastname"] },
                                        firstname: '$firstname',
                                        middlename: '$middlename',
                                        lastname: '$lastname',
                                        birthday: {
                                            $dateToString: {
                                                format: "%Y-%m-%d",
                                                date: "$birthday",
                                            }
                                        },
                                        gender: '$gender',
                                        bloodtype: '$bloodtype'
                                    }
                                },
                                {
                                    $group: {
                                        _id: {
                                            fullname: '$fullname',
                                            firstname: '$firstname',
                                            middlename: '$middlename',
                                            lastname: '$lastname',
                                            birthday: '$birthday',
                                            gender: '$gender',
                                            bloodtype: '$bloodtype',
                                        },
                                        count: { $sum: 1 },
                                        donated: { $sum: 1 },
                                    }
                                },
                                {
                                    $sort: {
                                        count: -1,
                                        donated: -1,
                                        '_id.lastname': 1,
                                        '_id.birthday': -1,
                                    }
                                },
                                {
                                    $skip: Number((page - 1) * limit),
                                },
                                {
                                    $limit: Number(limit),
                                },
                            ]),
                            Donor.aggregate([
                                {
                                    $match: {
                                        bleed: "Yes",
                                        ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        ...(timeframe ? {
                                            date: {
                                                $gte: new Date(Number(timeframe.split("-")[0])),
                                                $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                            }
                                        } : {}),
                                        ...(search ? {
                                            $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                                [key]: {
                                                    $regex: new RegExp(search, 'i'),
                                                },
                                            }))
                                        } : {}),
                                    }
                                },
                                {
                                    $project: {
                                        fullname: { $concat: ["$firstname", " ", "$lastname"] },
                                        firstname: '$firstname',
                                        middlename: '$middlename',
                                        lastname: '$lastname',
                                        birthday: {
                                            $dateToString: {
                                                format: "%Y-%m-%d",
                                                date: "$birthday",
                                            }
                                        },
                                        gender: '$gender',
                                        bloodtype: '$bloodtype'
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        total: { $sum: 1 },
                                    }
                                },
                            ]),
                        ]);
                        return res.send({ total: records[0] ? Number(records[0].total) : 0, header, body: result.map(data => ({ ...data._id, donated: data.donated })) });;
                    case "donor-result":
                        header = [
                            { key: "date", label: "Date Donated", options: { view: 1 } },
                            { key: "fullname", label: "Full Name", options: { view: 1 } },
                            { key: "firstname", label: "First Name", options: { view: 1, } },
                            { key: "lastname", label: "Last Name", options: { view: 1, } },
                            { key: "birthday", label: "Birthday", options: { view: 1 } },
                            { key: "barangay", label: "Barangay", options: { view: 1, edit: 1 } },
                            { key: "gender", label: "Gender", options: { view: 1 } },
                            { key: "bloodbank", label: "Blood Bank", options: { view: 1 } },
                            { key: "bloodtype", label: "Bloodtype", options: { view: 1 } },
                        ];
                        const [donors, totals] = await Promise.all([
                            Donor.aggregate([
                                {
                                    $match: {
                                        bleed: "Yes",
                                        ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        ...(timeframe ? {
                                            date: {
                                                $gte: new Date(Number(timeframe.split("-")[0])),
                                                $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                            }
                                        } : {}),
                                        ...(search ? {
                                            $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                                [key]: {
                                                    $regex: new RegExp(search, 'i'),
                                                },
                                            }))
                                        } : {}),
                                    }
                                },
                                {
                                    $project: {
                                        fullname: { $concat: ["$firstname", " ", "$lastname"] },
                                        firstname: "$firstname",
                                        middlename: "$middlename",
                                        lastname: "$lastname",
                                        date: "$date",
                                        birthday: {
                                            $dateToString: {
                                                format: "%Y-%m-%d",
                                                date: "$birthday",
                                            }
                                        },
                                        date: {
                                            $dateToString: {
                                                format: "%Y-%m-%d",
                                                date: "$date"
                                            }
                                        },
                                        barangay: "$barangay",
                                        gender: "$gender",
                                        bloodtype: "$bloodtype",
                                        bloodbank: "$bloodbank",
                                    }
                                },
                                { $sort: { date: 1 } },
                                { $skip: ((page - 1) * limit) },
                                { $limit: Number(limit) },
                            ]),
                            Donor.aggregate([
                                {
                                    $match: {
                                        bleed: "Yes",
                                        ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        ...(timeframe ? {
                                            date: {
                                                $gte: new Date(Number(timeframe.split("-")[0])),
                                                $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                            }
                                        } : {}),
                                        ...(search ? {
                                            $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                                [key]: {
                                                    $regex: new RegExp(search, 'i'),
                                                },
                                            }))
                                        } : {}),
                                    }
                                },
                                {
                                    $project: {
                                        fullname: { $concat: ["$firstname", " ", "$lastname"] },
                                        // date: "$date",
                                        birthday: {
                                            $dateToString: {
                                                format: "%Y-%m-%d",
                                                date: "$birthday",
                                            }
                                        },
                                        date: {
                                            $dateToString: {
                                                format: "%Y-%m-%d",
                                                date: "$date"
                                            }
                                        },
                                        barangay: "$barangay",
                                        gender: "$gender",
                                        bloodtype: "$bloodtype",
                                        bloodbank: "$bloodbank",
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        total: { $sum: 1 },
                                    }
                                },
                            ]),
                        ]);

                        return res.send({ header, body: donors, total: totals[0].total })
                    case "hospital-active":
                        Model = User;
                        header = [
                            { key: "fullname", label: "Full Name", options: { view: 1 } },
                            { key: "email", label: "Email", options: { view: 1 } },
                            { key: "contact", label: "Contact", options: { view: 1, edit: 1 } },
                            { key: "affiliation", label: "Hospital Name", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } }
                        ];
                        protect = [];
                        query = {
                            role: "hospital",
                            status: "Active",
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "hospital-inactive":
                        Model = User;
                        header = [
                            { key: "fullname", label: "Full Name", options: { view: 1 } },
                            { key: "email", label: "Email", options: { view: 1 } },
                            { key: "contact", label: "Contact", options: { view: 1, edit: 1 } },
                            { key: "affiliation", label: "Hospital Name", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } }
                        ];
                        protect = [];
                        query = {
                            role: "hospital",
                            status: "Inactive",
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !strictSearch.includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "bloodbank-active":
                        Model = User;
                        header = [
                            { key: "fullname", label: "Full Name", options: { view: 1 } },
                            { key: "email", label: "Email", options: { view: 1 } },
                            { key: "contact", label: "Contact", options: { view: 1, edit: 1 } },
                            { key: "affiliation", label: "Bloodbank Name", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } }
                        ];
                        protect = [];
                        query = {
                            role: "bloodbank",
                            status: "Active",
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !["date", "quantity", "birthday"].includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;
                    case "bloodbank-inactive":
                        Model = User;
                        header = [
                            { key: "fullname", label: "Full Name", options: { view: 1 } },
                            { key: "email", label: "Email", options: { view: 1 } },
                            { key: "contact", label: "Contact", options: { view: 1, edit: 1 } },
                            { key: "affiliation", label: "Bloodbank Name", options: { view: 1 } },
                            { key: "status", label: "Status", options: { view: 1 } }
                        ];
                        protect = [];
                        query = {
                            role: "bloodbank",
                            status: "Inactive",
                            ...(timeframe ? {
                                created_at: {
                                    $gte: new Date(Number(timeframe.split("-")[0])),
                                    $lte: new Date(Number(timeframe.split("-")[1]) + 86399999),
                                }
                            } : {}),
                            ...(search ? {
                                $or: header.filter(item => !["date", "quantity", "birthday"].includes(item.key)).map(({ key }) => ({
                                    [key]: {
                                        $regex: new RegExp(search, 'i'),
                                    },
                                }))
                            } : {}),
                        };
                        break;

                    default:
                        return res.status(http.bad_request).json({ error: "Invalid subcategory." });

                }

                [total] = await Promise.all([
                    Model.countDocuments(query),
                ]);

                data = await Model.find(query, protect.map(item => "-".concat(item)).join(" "))
                    .skip((page - 1) * limit)
                    .limit(Number(limit))
                    .sort({ date: -1, fullname: 1 });

                body = data.map(field => ({
                    ...field._doc,
                    ...(field.date ? { date: dateFormat(field.date) } : {}),
                    ...(field.created_at ? { created_at: dateFormat(field.created_at) } : {}),
                    ...(field.birthday ? { birthday: dateFormat(field.birthday) } : {}),
                }));

                return res.json({ total, header, body });

            case "c":
                switch (secondary) {

                    case "blood-availability":
                        try {
                            const bloodTypes = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];

                            const [supply, demand] = await Promise.all([
                                Donor.aggregate([
                                    {
                                        $match: {
                                            ...(type ? { bloodbank: String(type) } : {}),
                                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        },
                                    },
                                    {
                                        $group: {
                                            _id: '$bloodtype',
                                            count: { $sum: 1 },
                                        },
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            bloodtype: '$_id',
                                            count: 1,
                                        },
                                    },
                                ]),
                                Request.aggregate([
                                    {
                                        $match: {
                                            status: "Approved",
                                            ...(type ? { bloodbank: String(type) } : {}),
                                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        },
                                    },
                                    {
                                        $group: {
                                            _id: '$bloodtype',
                                            count: { $sum: 1 },
                                        },
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            bloodtype: '$_id',
                                            count: 1,
                                        },
                                    },
                                ]),

                            ]);

                            // Create a map to store supply and demand counts for each blood type
                            const countsMap = {};
                            bloodTypes.forEach(type => {
                                countsMap[type] = { supply: 0, demand: 0 };
                            });

                            // Populate supply counts
                            supply.forEach(({ count, bloodtype }) => {
                                countsMap[bloodtype].supply += count;
                            });

                            // Populate demand counts
                            demand.forEach(({ count, bloodtype }) => {
                                countsMap[bloodtype].demand += count;
                            });

                            // Calculate the difference between supply and demand for each blood type
                            const result = Object.keys(countsMap).map(type => ({
                                label: type,
                                data: [Math.max(countsMap[type].supply - countsMap[type].demand, 0)],
                            }));

                            console.log(result)

                            const supplyData = [];
                            const demandData = [];
                            bloodTypes.forEach(type => {
                                supplyData.push(Number(Math.max(countsMap[type].supply - countsMap[type].demand, 0)));
                                demandData.push(Number(-countsMap[type].demand));
                            });

                            const datasets = [
                                {
                                    label: 'Supply',
                                    data: supplyData,
                                },
                                {
                                    label: 'Demand',
                                    data: demandData,
                                },
                            ];

                            return res.json({ spreadsheet: { header: [], body: [], }, datasets, labels: bloodTypes });
                        } catch (error) {
                            console.log(error);
                            return res.status(http.bad_request).json({ error: error.message });
                        }
                    case "bleed-bloodbank":
                        try {
                            const bloodTypes = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];

                            const [supply, demand] = await Promise.all([
                                Donor.aggregate([
                                    {
                                        $match: {
                                            ...(type ? { bloodbank: String(type) } : {}),
                                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        },
                                    },
                                    {
                                        $group: {
                                            _id: '$bloodtype',
                                            count: { $sum: 1 },
                                        },
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            bloodtype: '$_id',
                                            count: 1,
                                        },
                                    },
                                ]),
                                Request.aggregate([
                                    {
                                        $match: {
                                            status: "Approved",
                                            ...(type ? { bloodbank: String(type) } : {}),
                                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                        },
                                    },
                                    {
                                        $group: {
                                            _id: '$bloodtype',
                                            count: { $sum: 1 },
                                        },
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            bloodtype: '$_id',
                                            count: 1,
                                        },
                                    },
                                ]),

                            ]);

                            // Create a map to store supply and demand counts for each blood type
                            const countsMap = {};
                            bloodTypes.forEach(type => {
                                countsMap[type] = { supply: 0, demand: 0 };
                            });

                            // Populate supply counts
                            supply.forEach(({ count, bloodtype }) => {
                                countsMap[bloodtype].supply += count;
                            });

                            // Populate demand counts
                            demand.forEach(({ count, bloodtype }) => {
                                countsMap[bloodtype].demand += count;
                            });

                            // Calculate the difference between supply and demand for each blood type
                            const datasets = Object.keys(countsMap).map(type => ({
                                label: type,
                                data: [Math.max(countsMap[type].supply - countsMap[type].demand, 0)],
                            }));

                            return res.json({ spreadsheet: { header: [], body: [], }, datasets, labels: ["Supply"] });
                        } catch (error) {
                            console.log(error);
                            return res.status(http.bad_request).json({ error: error.message });
                        }

                        // case "bleed-bloodbank":
                        return Donor.aggregate([
                            {
                                $match: {
                                    ...(type ? { bloodbank: String(type) } : {}),
                                    ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                    // date: {
                                    //     $gte: new Date(`${currentYear}-${date.getMonth()}-${date.getDate()}T00:00:00.000Z`),
                                    //     $lte: new Date(`${currentYear}-${date.getMonth() + 1}-${date.getDate()}T00:00:00.000Z`),
                                    // },
                                },
                            },
                            {
                                $group: {
                                    _id: '$bloodtype',
                                    count: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    bloodtype: '$_id',
                                    count: 1,
                                },
                            },
                        ]).then(result => {
                            const bloodTypes = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];
                            // datasets = bloodTypes.map(type => {
                            //     const foundType = result.find(item => item.bloodtype === type);
                            //     const count = foundType ? foundType.count : 0;
                            //     return {
                            //         label: type,
                            //         data: [count]
                            //     };
                            // });

                            labels = [date.getFullYear()];
                            // datasets = result.filter(data => bloodTypes.some(blood => blood === data.bloodtype))
                            //     .map(data => ({ label: data.bloodtype, data: [data.count] }))
                            //     .sort((a, b) => {
                            //         if (a.label < b.label) return -1;
                            //         if (a.label > b.label) return 1;
                            //         return 0;
                            //     });


                            datasets = bloodTypes.map(type => {
                                const foundType = result.find(item => item.bloodtype === type);
                                const count = foundType ? foundType.count : 0;
                                return {
                                    label: type,
                                    data: [count]
                                };
                            });
                            res.json({ spreadsheet: { header: [], body: [], }, labels, datasets });
                        });

                    case "request-bloodtype":
                        return Request.aggregate([
                            {
                                $match: {
                                    ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                                    date: {
                                        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                                        $lte: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: '$bloodtype',
                                    totalRequests: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    bloodtype: '$_id',
                                    totalRequests: 1,
                                },
                            },
                        ]).then(result => {
                            const bloodTypes = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];

                            labels = bloodTypes;
                            datasets = [
                                {
                                    label: 'Total Request by Blood Type',
                                    data: bloodTypes.map(bloodType => {
                                        const matchedBloodType = result.find(item => item.bloodtype === bloodType);
                                        return matchedBloodType ? matchedBloodType.totalRequests : 0;
                                    }),
                                },
                            ];

                            res.json({
                                spreadsheet: {
                                    header: [],
                                    body: [],
                                },
                                labels,
                                datasets,
                            });
                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });

                    case "request-bloodbag":
                        return Request.aggregate([
                            {
                                $match: {
                                    ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                                    date: {
                                        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                                        $lte: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        month: { $month: '$date' },
                                    },
                                    totalQuantity: { $sum: { $toInt: '$quantity' } },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    totalQuantity: 1,
                                },
                            },
                            {
                                $sort: {
                                    month: 1,
                                },
                            },
                        ]).then(result => {

                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

                            labels = months;
                            datasets = [
                                {
                                    label: 'Blood Bag Quantity by Month',
                                    data: months.map(month => {
                                        const matchedMonth = result.find(item => item.month === months.indexOf(month) + 1);
                                        return matchedMonth ? matchedMonth.totalQuantity : 0;
                                    }),
                                },
                            ];

                            res.json({
                                spreadsheet: {
                                    header: [],
                                    body: [],
                                },
                                labels,
                                datasets,
                            });
                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                    case "request-status":
                        return Request.aggregate([
                            {
                                $match: {
                                    ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        month: { $month: '$date' },
                                        status: '$status',
                                    },
                                    count: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    status: '$_id.status',
                                    count: 1,
                                },
                            },
                            {
                                $sort: {
                                    month: 1,
                                },
                            },
                        ]).then(result => {

                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

                            const labels = months;
                            const approvedData = Array.from({ length: labels.length }, () => 0);
                            const declinedData = Array.from({ length: labels.length }, () => 0);

                            result.forEach(item => {
                                const monthIndex = item.month - 1;
                                const dataIndex = labels.indexOf(months[monthIndex]);
                                if (item.status === 'Approved') {
                                    approvedData[dataIndex] = item.count;
                                } else if (item.status === 'Declined') {
                                    declinedData[dataIndex] = item.count;
                                }
                            });

                            const datasets = [
                                {
                                    label: 'Approved Requests',
                                    data: approvedData,
                                },
                                {
                                    label: 'Declined Requests',
                                    data: declinedData,
                                },
                            ];

                            res.json({
                                spreadsheet: {
                                    header: [],
                                    body: [],
                                },
                                labels,
                                datasets,
                            });
                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                        return;
                    case "request-total":
                        return Request.aggregate([
                            {
                                $match: {
                                    ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },

                                },
                            },
                            {
                                $group: {
                                    _id: { month: { $month: '$date' } },
                                    totalRequests: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    totalRequests: 1,
                                },
                            },
                            {
                                $sort: {
                                    '_id.month': 1,
                                },
                            }
                        ]).then(result => {
                            const months = [currentYear, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

                            labels = months;

                            datasets = [
                                {
                                    label: 'Total Request by Months',
                                    data: [0, ...months.map(month => {
                                        const matchedMonth = result.find(item => item.month === months.indexOf(month) + 1);
                                        return matchedMonth ? matchedMonth.totalRequests : 0;
                                    })],
                                }
                            ];

                            res.json({
                                spreadsheet: {
                                    header: [],
                                    body: [],
                                }, labels, datasets
                            });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                    case "bleed-screened":
                        return Event.aggregate([
                            {
                                $match: {
                                    ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                    status: "Active",
                                    bleed: {
                                        $exists: true,
                                    },
                                    screened: {
                                        $exists: true,
                                    },
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        month: { $month: '$date' },
                                    },
                                    screened: { $sum: { $toInt: '$screened' } },
                                    bleed: { $sum: { $toInt: '$bleed' } },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    screened: 1,
                                    bleed: 1,
                                },
                            },
                            {
                                $sort: {
                                    month: 1,
                                },
                            },
                        ]).then(result => {
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
                            labels = result.map(item => months[item.month - 1]);
                            datasets = [
                                {
                                    label: 'screened',
                                    data: result.map(item => item.screened),
                                },
                                {
                                    label: 'bleed',
                                    data: result.map(item => item.bleed),
                                },
                            ];

                            res.json({ spreadsheet: { header: [], body: [], }, labels, datasets });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });

                    case "approved-declined":
                        return Request.aggregate([
                            {
                                $match: {
                                    ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                    status: { $in: ["Approved", "Declined"] },
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        month: { $month: '$date' },
                                    },
                                    approved: {
                                        $sum: {
                                            $cond: [{ $eq: ["$status", "Approved"] }, 1, 0]
                                        }
                                    },
                                    declined: {
                                        $sum: {
                                            $cond: [{ $eq: ["$status", "Declined"] }, 1, 0]
                                        }
                                    },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    approved: 1,
                                    declined: 1,
                                },
                            },
                            {
                                $sort: {
                                    month: 1,
                                },
                            },
                        ]).then(result => {
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
                            labels = result.map(item => months[item.month - 1]);
                            datasets = [
                                {
                                    label: 'Approved',
                                    data: result.map(item => item.approved),
                                },
                                {
                                    label: 'Declined',
                                    data: result.map(item => item.declined),
                                },
                            ];

                            res.json({ spreadsheet: { header: [], body: [], }, labels, datasets });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });

                    case "bleed-forecast":
                        return Event.aggregate([
                            {
                                $match: {
                                    status: "Active",
                                    bleed: {
                                        $exists: true,
                                        $ne: null,
                                    },
                                    screened: {
                                        $exists: true,
                                        $ne: null,
                                    },
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        month: { $month: '$date' },
                                    },
                                    bleed: { $sum: { $toInt: '$bleed' } },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    bleed: 1,
                                },
                            },
                            {
                                $sort: {
                                    month: 1,
                                },
                            },
                        ]).then(result => {
                            let analysis, status;
                            const months = [currentYear, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
                            labels = months
                            const tempbleed = result.map(item => item.bleed);
                            const tempforecast = forecasting(Math.abs(tempbleed.length - 12), tempbleed);

                            const forecast = Array(12).fill(null);
                            const table_body = Array(12).fill(null);
                            forecast.splice(-tempforecast.length - 1, tempforecast.length + 1, tempbleed[tempbleed.length - 1], ...tempforecast);
                            table_body.splice(-tempforecast.length - 1, tempforecast.length + 1, null, ...tempforecast);


                            const bleed = Array(12).fill(null);
                            bleed.splice(0, tempbleed.length, ...tempbleed);

                            datasets = [
                                {
                                    label: 'bleed',
                                    data: [0, ...bleed],
                                    fill: 1,
                                },
                                {
                                    label: 'forecast',
                                    data: [0, ...tempbleed, ...tempforecast],
                                    fill: 1,
                                    borderDash: [10, 5],
                                },
                            ];


                            if (tempforecast.length > 0) {
                                const trends = trend(tempforecast);

                                if (trends) {
                                    status = trends.status;
                                    analysis = trends.analysis;
                                }
                            } else {
                                analysis = "For the year 2023, there's no forecasted data available.";
                                status = "No data available";
                            }

                            res.json({
                                analysis,
                                status,
                                spreadsheet: {
                                    header: [
                                        { key: "timeframe", label: "Timeframe" },
                                        { key: "bleed", label: "Total Bleed" },
                                        { key: "forecasted", label: "Forecasting" },
                                    ],
                                    body: Array.from({ length: 12 }, (_, index) => ({
                                        timeframe: [currentYear, months[index + 1]].join(" "),
                                        bleed: bleed[index] || "-",
                                        forecasted: table_body[index] || "-",
                                        fill: true,
                                    })),
                                }, labels, datasets
                            });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                    case "bleed-bloodtype":
                        return Donor.aggregate([
                            {
                                $match: {
                                    ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                    bleed: "Yes",
                                    screened: "Yes",
                                },
                            },
                            {
                                $group: {
                                    _id: '$bloodtype',
                                    data: { $sum: 1 }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    label: '$_id',
                                    data: 1
                                }
                            }
                        ]).then(result => {
                            labels = result.map(item => item.label);

                            datasets = [
                                {
                                    data: result.map(item => item.data),
                                    // data: result.map(item => item.data).sort(),

                                }
                            ];

                            res.json({ spreadsheet: { header: [], body: [], }, labels, datasets, result });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                    case "donor-gender":
                        return Donor.aggregate([
                            {
                                $match: {
                                    gender: {
                                        $exists: true,
                                        $ne: null,
                                    },
                                    bleed: "Yes"
                                },
                            },
                            {
                                $group: {
                                    _id: "$gender",
                                    data: { $sum: 1 }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    label: '$_id',
                                    data: 1
                                }
                            }
                        ]).then(result => {
                            labels = result.map(item => item.label);

                            datasets = [
                                {
                                    label: "Gender",
                                    data: result.map(item => item.data),
                                },
                            ];

                            res.json({ spreadsheet: { header: [], body: [], }, labels, datasets });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });

                    case "donation-activity":
                        return Donor.aggregate([
                            {
                                $match: {
                                    ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },

                                },
                            },
                            {
                                $group: {
                                    _id: { month: { $month: '$date' } },
                                    total: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    total: 1,
                                },
                            },
                            {
                                $sort: {
                                    '_id.month': 1,
                                },
                            }
                        ]).then(result => {
                            const months = [currentYear, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

                            labels = months;

                            datasets = [
                                {
                                    label: 'Total Donation by Months',
                                    data: [0, ...months.map(month => {
                                        const matchedMonth = result.find(item => item.month === months.indexOf(month) + 1);
                                        return matchedMonth ? matchedMonth.total : 0;
                                    })],
                                }
                            ];

                            res.json({
                                spreadsheet: {
                                    header: [],
                                    body: [],
                                }, labels, datasets
                            });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                    case "request-total":
                        return Donor.aggregate([
                            {
                                $match: {
                                    ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                                    date: {
                                        $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                        $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                                    },

                                },
                            },
                            {
                                $group: {
                                    _id: { month: { $month: '$date' } },
                                    total: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    month: '$_id.month',
                                    total: 1,
                                },
                            },
                            {
                                $sort: {
                                    '_id.month': 1,
                                },
                            }
                        ]).then(result => {
                            const months = [currentYear, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

                            labels = months;

                            datasets = [
                                {
                                    label: 'Total Request by Months',
                                    data: [0, ...months.map(month => {
                                        const matchedMonth = result.find(item => item.month === months.indexOf(month) + 1);
                                        return matchedMonth ? matchedMonth.total : 0;
                                    })],
                                }
                            ];

                            res.json({
                                spreadsheet: {
                                    header: [],
                                    body: [],
                                }, labels, datasets
                            });

                        }).catch(err => {
                            console.error('Error during aggregation:', err);
                            res.status(500).json({ error: 'An error occurred', error: err.message });
                        });
                    default:
                        return res.status(http.bad_request).json({ message: "Invalid category." });
                }
            case "t":
                switch (secondary) {
                    case "donor-total":
                        Model = Donor;
                        queryCurrent = {
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            bleed: "Yes",
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            bleed: "Yes",
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            bleed: "Yes",
                        };
                        break;
                    case "event-screened":
                        queryCurrent = {
                            status: "Active",
                            screened: {
                                $exists: true,
                                $ne: null,
                            },
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            status: "Active",
                            screened: {
                                $exists: true,
                                $ne: null,
                            },
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`), s
                            },
                        };
                        queryOverall = {
                            status: "Active",
                        };
                        Model = Event;
                        break;
                    case "event-bleed":
                        queryCurrent = {
                            status: "Active",
                            bleed: {
                                $exists: true,
                                $ne: null,
                            },
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            status: "Active",
                            bleed: {
                                $exists: true,
                                $ne: null,
                            },
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            status: "Active",
                        };
                        Model = Event;
                        break;
                    case "event-total":
                        Model = Event;
                        queryCurrent = {
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            status: "Active",
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            status: "Active",
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            status: "Active",
                        };
                        break;
                    case "donor-total":
                        Model = Donor;
                        queryCurrent = {
                            // status: "Active",
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            // status: "Active",
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            // status: "Active",
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                        };
                        break;
                    case "request-declined":
                        queryCurrent = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Declined",
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Declined",
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Declined",
                        };
                        Model = Request;
                        break;
                    case "request-approved":
                        queryCurrent = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Approved",
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Approved",
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Approved",
                        };
                        Model = Request;
                        break;
                    case "request-pending":
                        queryCurrent = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Pending",
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Pending",
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            status: "Pending",
                        };
                        Model = Request;
                        break;
                    case "request-total":
                        queryCurrent = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            status: {
                                $ne: null,
                                $exists: true,
                            },
                            date: {
                                $gte: new Date(`${currentYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${currentYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryPrevious = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            status: {
                                $ne: null,
                                $exists: true,
                            },
                            date: {
                                $gte: new Date(`${previousYear - 1}-12-31T16:00:00.000Z`),
                                $lte: new Date(`${previousYear}-12-31T15:59:59.999Z`),
                            },
                        };
                        queryOverall = {
                            ...(hospital_id ? { hospital_id: ObjectId(hospital_id) } : {}),
                            ...(bloodbank_id ? { bloodbank_id: ObjectId(bloodbank_id) } : {}),
                            status: {
                                $ne: null,
                                $exists: true,
                            }
                        };
                        Model = Request;
                        break;

                    default:
                        return res.json({ current: 0, previous: 0, overall: 0, status: "No data" });
                }

                const [current, previous, overall] = await Promise.all([
                    Model.countDocuments(queryCurrent),
                    Model.countDocuments(queryPrevious),
                    Model.countDocuments(queryOverall),
                ]);

                let status = null;

                if (previous === 0) {
                    status = "No data for the previous year";
                } else {
                    const percentage = ((current - previous) / previous) * 100;

                    if (percentage > 0) {
                        status = `Shows ${Math.abs(current - previous)} items ahead from (${previous}) previous year`;
                    } else if (percentage === 0) {
                        status = "Same with previous year";
                    } else {
                        status = `Shows ${current - previous} items behind from (${previous}) previous year `;
                    }
                }

                return res.json({ current, previous, overall, status });
            default:
                return res.status(http.bad_request).json({ message: "Invalid category." });
        }
    } catch (error) {
        console.error(error);
        res.status(http.internal_server_error).json({ message: "An error has occured while processing the api request.", error })
    }
});

// server.post('/api/i/donor/batch', async (req, res) => {
//     try {
//         const data = req.body.data;
//         const operations = data.filter(item => item.date).map(item => ({
//             updateOne: {
//                 filter: { firstname: item.firstname, lastname: item.lastname, birthday: item.birthday, date: item.date },
//                 update: { $setOnInsert: item },
//                 upsert: true,
//             }
//         }));

//         await Donor.bulkWrite(operations, { ordered: false }).then(result => {
//             const updated = result.modifiedCount;
//             const upserted = result.upsertedCount;
//             return res.status(http.ok).json({ message: `There are ${updated} updated, and ${upserted} inserted.` });
//         }).catch(error => {
//             console.error('Error during bulk write:', error);
//             return res.status(http.internal_server_error).json({ message: "Error saving donors", error });
//         });

//     } catch (error) {
//         return res.status(http.internal_server_error).json({ message: "Error saving donors", error });
//     }
// });

server.post("/api/:category/:subcategory/:item", (req, res) => {
    try {
        const { category, subcategory, item } = req.params;
        const secondary = [subcategory.toLowerCase(), item.toLowerCase()].join("-");
        const ObjectId = (data) => new mongoose.Types.ObjectId(data);

        switch (category) {
            case "f":
                switch (secondary) {
                    case "event-new":

                        User.find({ role: 'bloodbank' })
                            .then(bloodbank => {
                                const ids = {};
                                bloodbank.forEach((doc) => {
                                    ids[doc.affiliation] = doc._id.toString();
                                });


                                if (ids[req.body.bloodbank]) {
                                    const newEvent = new Event({ ...req.body, bloodbank_id: ids[req.body.bloodbank] });

                                    newEvent.save()
                                        .then((_event) => {
                                            res.status(http.ok).json({ message: "Event saved succesfully." })
                                        })
                                        .catch((err) => {
                                            res.status(http.bad_request).json({ message: "Error saving event, duplicate keys found: " + Object.keys(err.keyValue) });
                                        });
                                }
                            });
                        return;
                    case "event-batch":
                        const data = req.body.data;

                        User.find({ role: 'bloodbank' })
                            .then(bloodbank => {
                                const ids = {};
                                bloodbank.forEach((doc) => {
                                    ids[doc.affiliation] = doc._id.toString();
                                });

                                const operations = data.filter(item => item.date && Object.keys(ids).includes(item.bloodbank)).map(item => {

                                    item.bloodbank_id = ObjectId(ids[item.bloodbank]);

                                    return {
                                        updateOne: {
                                            filter: { date: item.date },
                                            update: { $setOnInsert: item },
                                            upsert: true,
                                        }
                                    };
                                });

                                Event.bulkWrite(operations)
                                    .then(result => {
                                        const updated = result.modifiedCount;
                                        const upserted = result.upsertedCount;
                                        res.status(http.ok).json({ message: `There are ${updated} updated, and ${upserted} inserted.` });
                                    })
                                    .catch(err => {
                                        console.error('Error during bulk write:', err);
                                        return res.status(http.bad_request).json({ message: "Error saving events", error });
                                    });
                            })
                            .catch(err => {
                                console.error(err);
                            });
                        return;
                    case "hospital-new":
                        let string = Math.random().toString(32).substring(2, 10);

                        bcrypt.hash(string, Number(process.env.BCRYPT_SALT), (error, password) => {

                            if (error) {
                                console.error({ message: "Error in hashing", error });
                                return res.json({ message: "Error in hashing." });
                            }
                            const newHospital = new User({
                                role: "hospital",
                                password,
                                ...req.body,
                            });

                            newHospital.save()
                                .then((hospital) => {
                                    mailer({
                                        subject: "Account Registration [Hospital]",
                                        to: hospital.email,
                                        body: `
                                            <h1>Hi <b>${hospital.fullname}!</b></h1>
                                            <br>
                                            You have successfully registered as a hospital entity in the blood donation forecasting system.
                                            You can sign in <a href="https://blood-donation-forecasting.site/public/login">here</a>.
                                            <br>
                                            <br>
                                            <br>
                                            Please use this credentials:
                                            <br>
                                            Email: ${hospital.email}
                                            <br>
                                            Password: ${string}
                                            <br>
                                        `,
                                    })
                                    res.json({ message: "New hospital has been saved succesfully." });
                                })
                                .catch((err) => {
                                    res.status(http.bad_request).json({ message: "Error saving hospital, duplicate keys found: " + Object.keys(err.keyValue) });
                                });
                        });
                        return;

                    case "bloodbank-new":
                        let randomString = Math.random().toString(32).substring(2, 10);

                        bcrypt.hash(randomString, Number(process.env.BCRYPT_SALT), (error, password) => {

                            if (error) {
                                console.error({ message: "Error in hashing", error });
                                return res.json({ message: "Error in hashing." });
                            }
                            const newBloodbank = new User({
                                role: "bloodbank",
                                password,
                                ...req.body,
                            });

                            newBloodbank.save()
                                .then((bloodbank) => {
                                    mailer({
                                        subject: "Account Registration [Bloodbank]",
                                        to: bloodbank.email,
                                        body: `
                                                <h1>Hi <b>${bloodbank.fullname}!</b></h1>
                                                <br>
                                                You have successfully registered as a bloodbank entity in the blood donation forecasting system.
                                                You can sign in <a href="https://blood-donation-forecasting.site/public/login">here</a>.
                                                <br>
                                                <br>
                                                <br>
                                                Please use this credentials:
                                                <br>
                                                Email: ${bloodbank.email}
                                                <br>
                                                Password: ${randomString}
                                                <br>
                                            `,
                                    })
                                    res.json({ message: "New bloodbank has been saved succesfully." });
                                })
                                .catch((err) => {
                                    res.status(http.bad_request).json({ message: "Error saving bloodbank, duplicate keys found: " + Object.keys(err.keyValue) });
                                });
                        });
                        return;

                    case "request-new":

                        return User.find({ role: 'bloodbank' })
                            .then(bloodbank => {
                                const ids = {};
                                bloodbank.forEach((doc) => {
                                    ids[doc.affiliation] = doc._id.toString();
                                });

                                if (ids[req.body.bloodbank]) {
                                    const newRequest = new Request({
                                        ...req.body,
                                        bloodbank_id: ObjectId(ids[req.body.bloodbank]),
                                    });

                                    newRequest.save()
                                        .then(() => {
                                            res.json({ message: "New request has been saved succesfully." });
                                        })
                                        .catch((err) => {
                                            res.status(http.bad_request).json({ message: "Error saving event, duplicate keys found: " + Object.keys(err.keyValue) });
                                        });
                                } else {
                                    res.send({ message: "Error saving request" })
                                }
                            })
                            .catch(err => {
                                console.error(err);
                            });


                        return;
                    case "donor-batch":
                        try {
                            const data = req.body.data;

                            User.find({ role: 'bloodbank' })
                                .then(bloodbank => {
                                    const ids = {};
                                    bloodbank.forEach((doc) => {
                                        ids[doc.affiliation] = doc._id.toString();
                                    });
                                    const operations = data.filter(item => item.date && Object.keys(ids).includes(item.bloodbank)).map(item => {

                                        item.bloodbank_id = ObjectId(ids[item.bloodbank]);

                                        return {
                                            updateOne: {
                                                filter: { firstname: item.firstname, lastname: item.lastname, birthday: item.birthday, date: item.date },
                                                update: { $setOnInsert: item },
                                                upsert: true,
                                            }
                                        };
                                    });

                                    Donor.bulkWrite(operations, { ordered: false }).then(result => {
                                        const updated = result.modifiedCount;
                                        const upserted = result.upsertedCount;
                                        return res.status(http.ok).json({ message: `There are ${updated} updated, and ${upserted} inserted.` });
                                    }).catch(error => {
                                        console.error('Error during bulk write:', error);
                                        return res.status(http.internal_server_error).json({ message: "Error saving donors", error });
                                    });
                                })
                                .catch(err => {
                                    console.error(err);
                                });

                        } catch (error) {
                            return res.status(http.internal_server_error).json({ message: "Error saving donors", error });
                        }
                        return;
                    default:
                        return res.json({ message: "Invalid subcategory." });
                }
            default:
                return res.json({ message: "Invalid category." });
        }
    } catch (error) {
        console.error(error);
        return res.status(http.internal_server_error).json({ status: "An error has occured in inserting data.", error });
    }
});


server.put("/api/:category/:subcategory/:item/:id", async (req, res) => {
    try {
        const { subcategory, item, id } = req.params;

        const secondary = [subcategory.toLowerCase(), item.toLowerCase()].join("-");

        let Model, body, subject;

        switch (secondary) {
            case "event-schedule":
                Model = Event;
                break;
            case "request-pending":
                Model = Request;
                if (["APPROVED", "Approved", "approved"].includes(req.body.status)) {
                    subject = "Blood Request Approval";
                    body = `
                        <h2>Your request has been approved by $bloodbank.</h2>
                        <br>
                        Reference No.: $id
                        <br>
                        Patient Name: $patient
                        <br>
                        Bloodtype: $bloodtype
                        <br>
                        Diagnosis: $diagnosis
                        <br>
                        Date Submitted: $submitted
                        <br>
                        Date Requested: $requested
                    `
                } else if (["DECLINED", "Declined", "declined"].includes(req.body.status)) {
                    subject = "Blood Request Declined";
                    body = `
                        <h2>Your request has been declined by $bloodbank.</h2>
                        <br>
                        <br>
                        Reference No.: $id
                        <br>
                        Patient Name: $patient
                        <br>
                        Bloodtype: $bloodtype
                        <br>
                        Diagnosis: $diagnosis
                        <br>
                        Date Submitted: $submitted
                        <br>
                        Date Requested: $requested
                    `
                }
                break;
            case "hospital-active":
                Model = User;
                break;
            case "hospital-inactive":
                Model = User;
                break;
            case "bloodbank-active":
                Model = User;
                break;
            case "bloodbank-inactive":
                Model = User;
                break;
            default:
                return res.json({ message: "Invalid subcategory." });
        }
        const update = await Model.findByIdAndUpdate(id, { ...req.body }, { new: true });

        if (update) {

            if (["request-pending"].includes(secondary)) {
                const credentials = {
                    id: update._id,
                    patient: update.patient,
                    submitted: update.created_at,
                    requested: update.date,
                    bloodtype: update.bloodtype,
                    diagnosis: (update.diagnosis),
                    bloodbank: (update.bloodbank),
                };

                const email_content = replacewords(body, credentials);

                mailer({
                    subject,
                    to: update.email,
                    body: email_content,
                });
            }
            return res.status(http.ok).json({ message: "The data has been updated." });
        } else {
            return res.status(http.not_found).json({ message: "Resource not found." });
        }
    } catch (error) {
        return res.status(http.internal_server_error).json({ message: "An error has occured in updating data.", error });
    }
});

server.post("/api/v/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const date = new Date();
        if (!email || !password) {
            return res.status(http.internal_server_error).json({ message: "Your credentials is incorrect.", verified: false, });
        }

        const user = await User.findOne({ email, status: "Active", });

        if (!user) {
            return res.json({ message: "Your credentials is incorrect.", verified: false });
        }

        const hashedPassword = user.password;

        bcrypt.compare(password, hashedPassword, (error, result) => {
            if (!result) {
                return res.json({ verified: false, message: "Your credentials is invalid, please try again.", error });
            }
            return res.json({
                verified: true, message: "Your credentials is valid, logging in...",
                url: "/".concat(user.role),
                credentials: {
                    id: user._id,
                    name: user.fullname,
                    position: user.role,
                    email: user.email,
                },
                cookie: jwt.sign({ id: user._id, name: user.fullname, email: user.email, position: user.role, created_at: user.created_at }, process.env.JWT_SECRET_KEY),
            });
        })
    } catch (error) {
        return res.json({ verified: false, message: "We cannot proccess your credentials, please try again later.", error });
    }
});

server.listen(PORT, () => {
    console.log(`[Server Started] | Listening on port \x1b[32m${PORT}\x1b[0m`);
});