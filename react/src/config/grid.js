import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from "react";
import { Col, FormControl, Modal, Row } from "react-bootstrap";
import { Button as RsButton } from "rsuite";
import Swal from "sweetalert2";
import * as yup from 'yup';

import preferences from "../config/preferences";
import objects from "../helpers/objects";
import textcase from "../helpers/textcase";

const editModal = (type, data, table, user, closeModal, domain) => {

    // <td key={iterate}>{(column.key === "date" ? (!isNaN(new Date(row[column.key])) ? new Date(row[column.key]).toLocaleDateString() : options.default) : row[column.key]) || options.default}</td>

    const inputs = Object.entries(data).filter(([key]) => table.header.some(data => (data.options[type] && data.key === key))).reduce((result, [key, value]) => {
        result[key] = {
            children: null,
            component: "input",
            type: table.header.find(item => item.key === key).type || "text",
            initial: table.header.find(item => item.key === key).type === "date" ? [value.split("/")[2], value.split("/")[0], value.split("/")[1]].join("-") : value,
            // schema: table.header.find(item => item.key === key).required ? (table.header.find(item => item.key === key).type !== "text" ? yup.date() : yup.string()).required(textcase("sentence", table.header.find(item => item.key === key).label + " must be filled")) : yup.string(),
            schema: yup.string().required(textcase("sentence", key) + " is required"),
            ...{
                ...(Object.keys(preferences.options.chc).includes(value) ? {
                    component: "select",
                    children: Object.entries(preferences.options.chc).sort(([categoryA], [categoryB]) => categoryA - categoryB).map(([k, v]) => (
                        <option key={k} value={k} disabled={k === ""} >{k !== "" ? [k.padStart(2, "0"), "-", v].join(" ") : v}</option>
                    )),
                } : {}),

                ...(Object.values(preferences.options.bloodbank).includes(value) ? {
                    component: "select",
                    children: Object.entries(preferences.options.bloodbank).sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB)).map(([k, v]) => (
                        <option key={k} value={v} disabled={k === ""}>{v}</option>
                    )),
                } : {})
            },
        };

        return result;
    }, {});

    const submitEvent = async (values, { setSubmitting }) => {
        try {
            const response = await axios.put(domain.concat(table.api, "/", data._id), {
                barangay: preferences.options.chc[values.chc],
                ...values
            });

            const json = response.data;

            if (response.status === 200) {
                Swal.fire({
                    title: "Update Success",
                    html: json.message,
                    icon: "success",
                });
                closeModal({ visibility: false });
            } else {
                Swal.fire({
                    title: "Update Failed",
                    html: json.message,
                    icon: "warning",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Update Failed",
                html: error.response.data.message,
                icon: "warning",
            });
        }
    };

    return (
        <Formik {...{
            initialValues: objects.filterSpecific(inputs, "initial"),
            validationSchema: yup.object().shape(objects.filterSpecific(inputs, "schema")),
            onSubmit: submitEvent,
        }}>
            {({ isSubmitting }) => (
                <Form className="overflow-y-auto">
                    <Modal.Body>
                        {
                            Object.keys(inputs).map((data, index) => (
                                <Row key={index} className="mb-2">
                                    <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                        <div {...{
                                            htmlFor: data,
                                            className: "text-capitalize mb-1",
                                            dangerouslySetInnerHTML: { __html: data }
                                        }} />
                                    </Col>
                                    <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                        <Field {...{
                                            key: data,
                                            type: inputs[data].type || "text",
                                            name: data,
                                            className: inputs[data].component === "input" ? "form-control" : "form-select",
                                            placeholder: textcase("sentence", data),
                                            as: inputs[data].component,
                                            autoComplete: "off",
                                        }}>
                                            {inputs[data].children}
                                        </Field>
                                        <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                    </Col>
                                </Row>
                            ))
                        }
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <RsButton {...{
                            type: "submit",
                            color: "blue",
                            appearance: "primary",
                            className: "text-light",
                            size: "sm",
                        }}>Submit</RsButton>
                    </Modal.Footer>
                </Form>
            )}
        </Formik>
    );
};

const viewModal = (type, data, table) => {

    return (
        <Modal.Body>
            {
                Object.entries(data).filter(([key]) => table.header.some(data => (data.options[type] && data.key === key))).map(([key, value], index) => (
                    <Row className="mb-2 align-items-center" key={index}>
                        {
                            <Col {...{ md: 3, lg: 3 }}>
                                <div className="text-capitalize">
                                    {
                                        table.header.find(item => item.key === key).label
                                    }
                                </div>
                            </Col>
                        }
                        {
                            <Col {...{ md: 9, lg: 9 }}>
                                <FormControl size="sm" plaintext onChange={() => null} value={value} />
                            </Col>
                        }
                    </Row>
                ))
            }
        </Modal.Body>
    )
}

const grid = {
    admin: {
        "event-schedule": {
            api: "api/g/event/schedule",
            label: "Event Schedule",
            actions: ["view", "edit", "reject"],
            options: {},
            onClick: (type, data, table, user, setModal, domain) => {

                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Upcoming Event", html: viewModal(type, data, table, user, setModal) } };
                    case "edit":
                        return { modal: { visibility: true, title: "Edit Upcoming Event", html: editModal(type, data, table, user, setModal) } };
                    case "reject":
                        Swal.fire({
                            title: "Cancel Event",
                            html: "Do you want to cancel this event?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, cancel it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {

                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "Cancelled"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Cancelled Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Cancelled Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });

                        return;
                    default:
                        return;
                }
            },
        },
        "event-result": {
            api: "api/g/event/result",
            label: "Event Results",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Previous Event", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "request-rejected": {
            api: "api/g/request/rejected",
            label: "Rejected Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Rejected Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "request-pending": {
            api: "api/g/request/pending",
            label: "Pending Requests",
            actions: ["view", "accept", "reject"],
            options: {},
            onClick: async (type, data, table, user, setModal, domain) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Pending Request", html: viewModal(type, data, table) } };
                    case "accept":
                        return await Swal.fire({
                            title: "Request Approval",
                            html: "Do you want to approve this request?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, approve it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "approved"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    case "reject":
                        return await Swal.fire({
                            title: "Reject Request",
                            html: "Do you want to reject this request?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, disable it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "declined"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                        setModal({ visibility: false });
                                    }
                                }
                            } catch (error) {
                                await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    default:
                        return;
                }
            },
        },
        "request-approved": {
            api: "api/g/request/approved",
            label: "Approved Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Approved Requests", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "donor-list": {
            api: "api/g/donor/list",
            label: "Donor Leaderboards",
            actions: ["view"],
            options: {
                // disableSearch: true,
                // disableTimeframe: true,
            },
            onClick: (type, data, table, user, setModal) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Donor Ranking", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "donor-result": {
            api: "api/g/donor/result",
            label: "Donor Results",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user, setModal) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Donors Information", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "hospital-active": {
            api: "api/g/hospital/active",
            label: "Active Hospitals",
            actions: ["view", "reject"],
            options: {},
            onClick: (type, data, table, user, setModal, domain) => {

                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Active Hospital", html: viewModal(type, data, table) } };
                    case "reject":
                        return Swal.fire({
                            title: "Deactivate Account",
                            html: "Do you want to deactivate this account?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, deactivate it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "inactive"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    default:
                        return;
                }
            },
        },
        "hospital-inactive": {
            api: "api/g/hospital/inactive",
            label: "Inactive Hospitals",
            actions: ["view", "accept"],
            options: {},
            onClick: (type, data, table, user, setModal, domain) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Inactive Hospital", html: viewModal(type, data, table) } };
                    case "accept":
                        return Swal.fire({
                            title: "Activate Account",
                            html: "Do you want to activate this account?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, activate it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "active"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    default:
                        return;
                }
            },
        },
        "bloodbank-active": {
            api: "api/g/bloodbank/active",
            label: "Active Bloodbank",
            actions: ["view", "reject"],
            options: {},
            onClick: (type, data, table, user, setModal, domain) => {

                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Active Bloodbank", html: viewModal(type, data, table) } };
                    case "reject":
                        return Swal.fire({
                            title: "Deactivate Account",
                            html: "Do you want to deactivate this account?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, deactivate it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "inactive"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    default:
                        return;
                }
            },
        },
        "bloodbank-inactive": {
            api: "api/g/bloodbank/inactive",
            label: "Inactive Bloodbank",
            actions: ["view", "accept"],
            options: {},
            onClick: (type, data, table, user, setModal, domain) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Inactive Bloodbank", html: viewModal(type, data, table) } };
                    case "accept":
                        return Swal.fire({
                            title: "Activate Account",
                            html: "Do you want to activate this account?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, activate it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "active"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    default:
                        return;
                }
            },
        },
        "request-report": {
            api: "api/g/request/report",
            label: "Report Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },


    },
    bloodbank: {
        "donor-result": {
            api: "api/g/donor/result",
            label: "Donor Results",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user, setModal) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Donors Information", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "event-result": {
            api: "api/g/event/result",
            label: "Event Results",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Previous Event", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "request-report": {
            api: "api/g/request/report",
            label: "Report Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "request-pending": {
            api: "api/g/request/pending",
            label: "Pending Requests",
            actions: ["view", "accept", "reject"],
            options: {},
            onClick: async (type, data, table, user, setModal, domain) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    case "accept":
                        return await Swal.fire({
                            title: "Request Approval",
                            html: "Do you want to approve this request?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, approve it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "approved"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        setModal({ visibility: false });

                                        return await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                    }
                                }
                            } catch (error) {
                                return await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });
                    case "reject":
                        return await Swal.fire({
                            title: "Reject Request",
                            html: "Do you want to reject this request?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, disable it!'
                        }).then(async (result) => {
                            try {
                                if (result.isConfirmed) {
                                    const response = await axios.put(domain.concat(table.api, "/", data._id), {
                                        status: textcase("sentence", "declined"),
                                    });

                                    const json = response.data;

                                    if (response.status === 200) {
                                        await Swal.fire({
                                            title: "Update Success",
                                            html: json.message,
                                            icon: "success",
                                        });
                                        setModal({ visibility: false });
                                    }
                                }
                            } catch (error) {
                                await Swal.fire({
                                    title: "Update Failed",
                                    html: JSON.stringify(error),
                                    icon: "warning",
                                });
                            }
                        });

                    default:
                        return;
                }
            },
        },
        "request-approved": {
            api: "api/g/request/approved",
            label: "Approved Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "request-rejected": {
            api: "api/g/request/rejected",
            label: "Declined Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
    },
    hospital: {
        "request-report": {
            api: "api/g/request/report",
            label: "Report Requests",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
        "request-pending": {
            api: "api/g/request/pending",
            label: "Report Pending",
            actions: ["view"],
            options: {},
            onClick: (type, data, table, user) => {
                switch (type) {
                    case "view":
                        return { modal: { visibility: true, title: "View Report Request", html: viewModal(type, data, table) } };
                    default:
                        return;
                }
            },
        },
    },
};

export default grid;