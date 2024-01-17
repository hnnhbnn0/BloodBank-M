import FileDownloadIcon from '@rsuite/icons/FileDownload';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from "react";
import { Alert, Button as BsButton, Col, Modal, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ButtonToolbar, IconButton, Button as RsButton } from 'rsuite';
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import * as yup from 'yup';

import preferences from '../config/preferences';
import Auth from '../context/auth';
import objects from '../helpers/objects';

const Popup = {
    ImportDonors: () => {
        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const FileElement = React.useRef(null);

        const { user, domain } = Auth.getContext();

        const input = {
            file: {
                id: "file",
                label: "Upload Spreadsheet",
                initial: "",
                className: "form-control",
                type: "file",
                component: "input",
                ref: FileElement,
                accept: ".xls, .xlsx",
            }
        }

        const submit = async (values, { setSubmitting }) => {
            await Swal.fire({
                title: "Import Donors",
                html: `Are you sure to import donors?`,
                // footer: "There are " + data.length + " rows and " + Object.keys(json[0]).length + " columns.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, import it!'
            }).then(async (result) => {
                var formData = new FormData();
                var imagefile = document.querySelector('#file');
                formData.append("file", imagefile.files[0]);
                formData.append("author", user.id);

                if (result.isConfirmed) {
                    const response = await axios.post(domain.concat("api/i/donor/batch"), formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.status === 200) {
                        Swal.fire({
                            title: "Import Success",
                            html: "The events has been imported successfully.",
                            icon: "success",
                        });
                    } else {
                        Swal.fire({
                            title: "Import Failed",
                            html: "The events has not been imported.",
                            icon: "success",
                        });
                    }
                }

            });
        }

        return (
            <React.Fragment >
                <BsButton {...{
                    type: "button",
                    className: "text-truncate w-100 fs-4 btn-dynamic",
                    variant: "danger",
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Import Donors" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}
                >
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Batch Import Donors
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto" encType="multipart/form-data">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to import the profile of donors and their results.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer>
                                    <ButtonToolbar>
                                        <IconButton appearance="primary" color="green" icon={<FileDownloadIcon />} as={Link} to={domain.concat("files/template/donors")}> Download Template</IconButton>
                                        <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton>
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        )
    },
    AddEvent: () => {

        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const { user, domain } = Auth.getContext();

        const [data, setData] = React.useState([]);

        const get_data = async () => {
            try {
                const response = await axios.get(domain.concat("api/q/bloodbank/list"));

                console.log(response.data.result);

                setData(response.data.result);
            } catch (err) {

            }
        }

        React.useEffect(() => {
            get_data();
        }, []);
        const input = {
            // title: {
            //     label: "Event Name",
            //     initial: "",
            //     className: "form-control form-control",
            //     type: "text",
            //     schema: yup.string().required("Event title is required!"),
            //     component: "input",
            // },
            date: {
                label: "Event Date",
                initial: "",
                className: "form-control formik",
                type: "date",
                schema: yup.date().required("Event Date is required!"),
                component: "input",
            },
            venue: {
                label: "Bloodletting Venue",
                initial: "",
                className: "form-control formik",
                type: "text",
                schema: yup.string().required("Event Venue is required!"),
                component: "input",
            },
            chc: {
                label: "City Health Center",
                initial: "",
                className: "form-select formik",
                type: "text",
                schema: yup.string().required("City Health Center is required!"),
                component: "select",
                children: Object.entries(preferences.options.chc).sort(([categoryA], [categoryB]) => categoryA - categoryB).map(([key, value]) => (
                    <option key={key} value={key} disabled={key === ""}>{key !== "" ? [key.padStart(2, "0"), "-", value].join(" ") : value}</option>
                )),
            },
            bloodbank: {
                label: "Blood Bank",
                initial: "",
                className: "form-select formik",
                type: "text",
                schema: yup.string().required("Bloodbank is required!"),
                component: "select",
                children: (
                    <React.Fragment>
                        <option value="" disabled>Bloodbank</option>
                        {
                            data.map(item => (
                                <option value={item.affiliation}>{item.affiliation}</option>

                            ))
                        }
                    </React.Fragment>
                ),
            },
            // spacer: "|",
            // file: {
            //     label: "Upload Spreadsheet",
            //     initial: "",
            //     className: "form-control",
            //     type: "file",
            //     component: "input",
            //     accept: ".xls, .xlsx",
            //     onChange: fileChangeEvent,
            // }
        };

        const submit = async (values, { setSubmitting }) => {
            try {

                if (new Date(values.date) <= new Date(Date.now())) {
                    return await Swal.fire({ title: "Invalid Date", icon: "warning", html: "Event date must be greater than the date today" });
                }

                return await Swal.fire({
                    title: 'Do you want to schedule this event?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, submit!'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const response = await axios.post(domain.concat("api/f/event/new"), {
                            ...values,
                            barangay: preferences.options.chc[values.chc],
                            author: user.id,
                        });

                        if (response.status === 200) {
                            await Swal.fire({
                                title: 'Submission Success',
                                html: response.data.message,
                                icon: 'success',
                                confirmButtonText: 'OK',
                            });

                            setModal({ visibility: false });
                        } else {
                            await Swal.fire({
                                title: 'Submission Failed',
                                text: 'The event has not been posted!',
                                icon: 'error',
                                confirmButtonText: 'OK',
                            });
                        }
                    }
                })

            } catch (error) {
                return await Swal.fire({
                    title: 'Submission Failed',
                    html: error.response.data.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            } finally {
                // setModal({ visibility: false });
            }
        };

        return (
            <React.Fragment>
                <BsButton {...{
                    type: "button",
                    className: "btn-dynamic text-truncate w-100 fs-4",
                    variant: "danger",
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Add Event" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}>
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Add Event
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to add upcoming events, and <span className="fw-semibold">only upcoming dates</span> are <span className="fw-semibold">accepted</span>.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer className="border-0">
                                    <ButtonToolbar>
                                        {/* <Dropdown appearance="primary" color="green" placement="topEnd" title="Import/Export">
                                            <Dropdown.Item type="button" icon={<FileUploadIcon />} onClick={fileClickEvent}>
                                                Import Spreadsheet
                                                <FormControl ref={ImportElement} type="file" name="file" accept=".xls, .xlsx, .csv" className="d-none" onChange={fileChangeEvent} />
                                            </Dropdown.Item>
                                            <Dropdown.Item type="button" icon={<PlusIcon />} as={Link} to="http://localhost:8080/files/template/events">Export Template</Dropdown.Item>
                                        </Dropdown> */}
                                        <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton>
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        );
    },
    ImportData: () => {
        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const { theme, user, domain } = Auth.getContext();

        const fileChangeEvent = (e) => {

            const file = e.target.files[0];
            const reader = new FileReader();
            let json;

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const header = ["date", "venue", "chc", "bloodbank", "screened", "bleed"];

                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                json = XLSX.utils.sheet_to_json(sheet, { range: "A3:F203", header, raw: false });

                const heading = Object.keys(json[0]);

                if (json.length > 0 && JSON.stringify(heading) === JSON.stringify(header)) {

                    // const filtered = json.filter(item => new Date(item.date) > new Date().setHours(0, 0, 0, 0));
                    const data = json
                        .filter(item => new Date(item.date) <= new Date().setHours(0, 0, 0, 0) && item.screened && item.bleed)
                        .map(item => {
                            const barangay = preferences.options.chc[item.chc];
                            const initialDate = new Date(item.date);
                            const adjustedDate = new Date(initialDate.getTime() - (initialDate.getTimezoneOffset() * 60000)).toISOString();
                            return { ...item, date: adjustedDate, barangay, author: user.id };
                        });

                    Swal.fire({
                        title: "Import Events",
                        html: `Are you sure to import events from <strong>${file.name}</strong>?`,
                        footer: "There are " + data.length + " rows and " + Object.keys(json[0]).length + " columns.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, import it!'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const response = await axios.post(domain.concat("api/f/event/batch"), {
                                data,
                                barangay: preferences.options.chc[result.chc],
                            });
                            if (response.status === 200) {
                                Swal.fire({
                                    title: "Import Success",
                                    html: response.data.message || "The events has been imported successfully.",
                                    icon: "success",
                                });
                            } else {
                                Swal.fire({
                                    title: "Import Failed",
                                    html: response.data.message || "The events has not been imported.",
                                    icon: "success",
                                });
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Import Failed",
                        html: "The events not been imported, because it was empty.",
                        icon: "error",
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            // disableInputs(false);
                        }
                    });
                }
            };

            reader.readAsArrayBuffer(file);
        }

        const input = {
            file: {
                label: "Upload Spreadsheet",
                initial: "",
                className: "form-control",
                type: "file",
                component: "input",
                accept: ".xls, .xlsx",
                onChange: fileChangeEvent,
            }
        }

        const submit = () => {

        }

        return (
            <React.Fragment >
                <BsButton {...{
                    type: "button",
                    className: "text-truncate w-100 fs-4",
                    variant: theme.value,
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Import Results" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}
                >
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Import Event Results
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to add previous events and their results, <span className="fw-semibold">only previous events</span> are <span className="fw-semibold">accepted</span>.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer>
                                    <ButtonToolbar>
                                        <IconButton appearance="primary" color="green" icon={<FileDownloadIcon />} as={Link} to={domain.concat("files/template/events")}>Download Template</IconButton>
                                        {/* <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton> */}
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        )
    },
    ImportDonorsData: () => {
        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const { theme, user, domain } = Auth.getContext();

        const fileChangeEvent = (e) => {

            const file = e.target.files[0];
            const reader = new FileReader();
            let json;

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const header = ["firstname", "middlename", "lastname", "birthday", "age", "gender", "barangay", "date", "venue", "chc", "bloodbank", "screened", "bleed", "bloodtype"];

                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                json = XLSX.utils.sheet_to_json(sheet, { range: "A2:N300", header, raw: false });

                const heading = Object.keys(json[0]);

                if (json.length > 0 && JSON.stringify(heading) === JSON.stringify(header)) {

                    const data = json.filter(item => ![null, undefined, ""].includes(item.date));

                    Swal.fire({
                        title: "Import Donors",
                        html: `Are you sure to import donor's data from <strong>${file.name}</strong>?`,
                        footer: "There are " + data.length + " rows and " + Object.keys(json[0]).length + " columns.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, import it!'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const response = await axios.post(domain.concat("api/f/donor/batch"), {
                                data,
                                author: user.id,
                            });
                            if (response.status === 200) {
                                Swal.fire({
                                    title: "Import Success",
                                    html: response.data.message || "The donor's data has been imported successfully.",
                                    icon: "success",
                                });
                            } else {
                                Swal.fire({
                                    title: "Import Failed",
                                    html: response.data.message || "The donor's data has not been imported.",
                                    icon: "success",
                                });
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Import Failed",
                        html: "The donor's data is not been imported, because it was empty.",
                        icon: "error",
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            // disableInputs(false);
                        }
                    });
                }
            };

            reader.readAsArrayBuffer(file);
        }

        const input = {
            file: {
                label: "Upload Results",
                initial: "",
                className: "form-control",
                type: "file",
                component: "input",
                accept: ".xls, .xlsx",
                onChange: fileChangeEvent,
            }
        }

        const submit = () => {

        }

        return (
            <React.Fragment >
                <BsButton {...{
                    type: "button",
                    className: "btn-dynamic text-truncate w-100 fs-4",
                    variant: "danger",
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Import Donors" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}
                >
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Batch Import Donors
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to import the profile of donors and their results.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer>
                                    <ButtonToolbar>
                                        <IconButton appearance="primary" color="green" icon={<FileDownloadIcon />} as={Link} to={domain.concat("files/template/donors")}>Download Template</IconButton>
                                        {/* <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton> */}
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        )
    },
    AddHospital: () => {

        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const { user, domain } = Auth.getContext();

        const input = {
            fullname: {
                label: "Full Name",
                initial: "",
                className: "form-control formik",
                type: "text",
                schema: yup.string()
                    .required("Full Name is required!"),
                component: "input",
            },
            // username: {
            //     label: "Username",
            //     initial: "",
            //     className: "form-control formik",
            //     type: "text",
            //     schema: yup.string()
            //         .required("Username is required!")
            //         .matches(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscore are allowed')
            //         .min(8, "Username must be at least 8 characters long"),
            //     component: "input",
            // },
            email: {
                label: "Email Address",
                initial: "",
                className: "form-control formik",
                type: "email",
                schema: yup.string()
                    .required("Email is required!")
                    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 'Please enter a valid email address.'),
                component: "input",
            },
            contact: {
                label: "Contact Number",
                placeholder: "9xxxxxxxxx",
                initial: "",
                className: "form-control formik",
                type: "number",
                schema: yup.string()
                    .required("Contact number is required!")
                    .matches(/^9\d{9}$/, 'Contact number must start with "9" followed by 9 digits'),
                component: "input",
            },
            affiliation: {
                label: "Affiliation",
                placeholder: "Hospital Name",
                initial: "",
                className: "form-control formik",
                type: "text",
                schema: yup.string().required("Affiliation is required!"),
                component: "input",
            },
        };

        const submit = async (values, { setSubmitting }) => {
            try {
                return await Swal.fire({
                    title: 'Do you want to create this hospital account?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, submit!'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const response = await axios.post(domain.concat("api/f/hospital/new"), {
                            ...values,
                            author: user.id,
                        });

                        if (response.status === 200) {
                            await Swal.fire({
                                title: 'Submission Success',
                                html: response.data.message,
                                icon: 'success',
                                confirmButtonText: 'OK',
                            });
                            setModal({ visibility: false });
                        }
                    }
                });
            } catch (error) {
                return await Swal.fire({
                    title: 'Submission Failed',
                    html: error.response.data.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            } finally {
                // setModal({ visibility: false });
            }
        };

        return (
            <React.Fragment>
                <BsButton {...{
                    type: "button",
                    className: "btn-dynamic text-truncate w-100 fs-4",
                    variant: "danger",
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Add Hospital" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}>
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Add Hospital
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to add hospital accounts, and <span className="fw-semibold">only verified users</span> are <span className="fw-semibold">accepted</span>.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].placeholder || input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer className="border-0">
                                    <ButtonToolbar>
                                        <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton>
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        )
    },
    AddBloodbank: () => {

        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const { user, domain } = Auth.getContext();

        const input = {
            fullname: {
                label: "Full Name",
                initial: "",
                className: "form-control formik",
                type: "text",
                schema: yup.string()
                    .required("Full Name is required!"),
                component: "input",
            },
            email: {
                label: "Email Address",
                initial: "",
                className: "form-control formik",
                type: "email",
                schema: yup.string()
                    .required("Email is required!")
                    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 'Please enter a valid email address.'),
                component: "input",
            },
            contact: {
                label: "Contact Number",
                placeholder: "9xxxxxxxxx",
                initial: "",
                className: "form-control formik",
                type: "number",
                schema: yup.string()
                    .required("Contact number is required!")
                    .matches(/^9\d{9}$/, 'Contact number must start with "9" followed by 9 digits'),
                component: "input",
            },
            affiliation: {
                label: "Affiliation",
                placeholder: "Bloodbank Name",
                initial: "",
                className: "form-control formik",
                type: "text",
                schema: yup.string().required("Affiliation is required!"),
                component: "input",
            },
        };

        const submit = async (values, { setSubmitting }) => {
            try {
                return await Swal.fire({
                    title: 'Do you want to create this bloodbank account?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, submit!'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const response = await axios.post(domain.concat("api/f/bloodbank/new"), {
                            ...values,
                            author: user.id,
                        });

                        if (response.status === 200) {
                            await Swal.fire({
                                title: 'Submission Success',
                                html: response.data.message,
                                icon: 'success',
                                confirmButtonText: 'OK',
                            });
                            setModal({ visibility: false });
                        }
                    };
                });
            } catch (error) {
                return await Swal.fire({
                    title: 'Submission Failed',
                    html: error.response.data.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            } finally {
                // setModal({ visibility: false });
            }
        };

        return (
            <React.Fragment>
                <BsButton {...{
                    type: "button",
                    className: "btn-dynamic text-truncate w-100 fs-4",
                    variant: "danger",
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Add Bloodbank" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}>
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Add Bloodbank
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to add bloodbank accounts, and <span className="fw-semibold">only verified users</span> are <span className="fw-semibold">accepted</span>.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].placeholder || input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer className="border-0">
                                    <ButtonToolbar>
                                        <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton>
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        )
    },

    AddRequest: () => {

        const [modal, setModal] = React.useState({
            visibility: false,
        });

        const { user, domain } = Auth.getContext();

        const [data, setData] = React.useState([]);

        const get_data = async () => {
            try {
                const response = await axios.get(domain.concat("api/q/bloodbank/list"));

                console.log(response.data.result);

                setData(response.data.result);
            } catch (err) {

            }
        }

        React.useEffect(() => {
            get_data();
        }, []);
        const input = {
            date: {
                label: "Date",
                initial: "",
                className: "form-control formik",
                type: "date",
                schema: yup.date()
                    .required("Date is required!"),
                component: "input",
            },
            patient: {
                label: "Patient Name",
                initial: "",
                className: "form-control formik",
                type: "text",
                schema: yup.string()
                    .required("Patient Name is required!"),
                component: "input",
            },
            diagnosis: {
                label: "Diagnosis",
                initial: "",
                className: "form-control formik",
                type: "string",
                schema: yup.string()
                    .required("Diagnosis is required!"),
                component: "input",
            },
            bloodtype: {
                label: "Blood Type",
                initial: "",
                className: "form-select formik",
                type: "text",
                schema: yup.string().required("Blood Type is required!"),
                component: "select",
                children: Object.entries(preferences.options.bloodtype).sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB)).map(([key, value]) => (
                    <option key={key} value={value} disabled={key === ""}>{value}</option>
                )),
            },
            bloodbank: {
                label: "Blood Bank",
                initial: "",
                className: "form-select formik",
                type: "text",
                schema: yup.string().required("Bloodbank is required!"),
                component: "select",
                children: (
                    <React.Fragment>
                        <option value="" disabled>Bloodbank</option>
                        {
                            data.map(item => (
                                <option value={item.affiliation}>{item.affiliation}</option>

                            ))
                        }
                    </React.Fragment>
                ),
            },
        };

        const submit = async (values, { setSubmitting }) => {
            try {
                await Swal.fire({
                    title: 'Do you want to create this blood request?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, submit!'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const initialDate = new Date(values.date);
                        const adjustedDate = new Date(initialDate.getTime() - (initialDate.getTimezoneOffset() * 60000)).toISOString();

                        const response = await axios.post(domain.concat("api/f/request/new"), {
                            ...values,
                            date: adjustedDate,
                            email: user.email,
                            hospital_id: user.id,
                            hospital: user.name,
                        });

                        if (response.status === 200) {
                            await Swal.fire({
                                title: 'Submission Success',
                                html: response.data.message,
                                icon: 'success',
                                confirmButtonText: 'OK',
                            });
                            setModal({ visibility: false });
                        };
                    }
                });
            } catch (error) {
                return await Swal.fire({
                    title: 'Submission Failed',
                    html: error.response.data.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            } finally {
                // setModal({ visibility: false });
            }
        };

        return (
            <React.Fragment>
                <BsButton {...{
                    type: "button",
                    className: "btn-dynamic text-truncate w-100 fs-4",
                    variant: "danger",
                    size: "lg",
                    onClick: () => setModal({ visibility: true }),
                    dangerouslySetInnerHTML: { __html: "Add Request" }
                }} />
                <Modal {...{
                    show: modal.visibility,
                    onHide: () => setModal({ visibility: false }),
                    backdrop: "static",
                    keyboard: true,
                    centered: true,
                    scrollable: true,
                    animation: true,
                    size: "lg",
                    fullscreen: "md-down",
                }}>
                    <Modal.Header className="border-0 text-center" closeButton>
                        <Modal.Title className="fs-4">
                            Add Blood Request
                        </Modal.Title>
                    </Modal.Header>
                    <Formik {...{
                        initialValues: objects.filterSpecific(input, "initial"),
                        validationSchema: yup.object().shape(objects.filterSpecific(input, "schema")),
                        onSubmit: submit,
                    }}>
                        {({ isSubmitting }) => (
                            <Form className="overflow-y-auto">
                                <Modal.Body className="border-0 mb-0">
                                    <Alert variant="info" className="fs-5">
                                        <i className="bi bi-exclamation-circle-fill me-2" />
                                        <span className="fs-5">This form is used to add hospital blood request.</span>
                                    </Alert>
                                    {
                                        Object.keys(input).map((data, index) => (
                                            <Row key={index} className="mb-2 align-content-center">
                                                <Col {...{ sm: 12, md: 4, lg: 3 }}>
                                                    <label {...{
                                                        htmlFor: data,
                                                        className: "text-capitalize mb-1",
                                                        dangerouslySetInnerHTML: { __html: input[data].label }
                                                    }} />
                                                </Col>
                                                <Col {...{ sm: 12, md: 8, lg: 9 }}>
                                                    {
                                                        data !== "spacer" ? (
                                                            <React.Fragment>
                                                                <Field {...{
                                                                    key: data,
                                                                    type: input[data].type,
                                                                    name: data,
                                                                    className: input[data].className,
                                                                    placeholder: input[data].placeholder || input[data].label,
                                                                    as: input[data].component,
                                                                    autoComplete: "off",
                                                                    ...(input[data].component === "textarea" ? { rows: 5 } : {}),
                                                                    ...input[data],
                                                                }}>
                                                                    {input[data].children}
                                                                </Field>
                                                                <ErrorMessage {...{ name: data, component: "span", className: "text-danger fs-6" }} />
                                                            </React.Fragment>
                                                        ) : (<hr className="p-1" />)
                                                    }
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Modal.Body>
                                <Modal.Footer className="border-0">
                                    <ButtonToolbar>
                                        {/* <Dropdown appearance="primary" color="green" placement="topEnd" title="Import/Export">
                                                <Dropdown.Item type="button" icon={<FileUploadIcon />} onClick={fileClickEvent}>
                                                    Import Spreadsheet
                                                    <FormControl ref={ImportElement} type="file" name="file" accept=".xls, .xlsx, .csv" className="d-none" onChange={fileChangeEvent} />
                                                </Dropdown.Item>
                                                <Dropdown.Item type="button" icon={<PlusIcon />} as={Link} to="http://localhost:8080/files/template/events">Export Template</Dropdown.Item>
                                            </Dropdown> */}
                                        <RsButton appearance="primary" color="blue" type="submit">Submit</RsButton>
                                    </ButtonToolbar>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </React.Fragment >
        )
    }
};

export default Popup;