import SearchIcon from '@rsuite/icons/Search';
import axios from "axios";
import React from "react";
import { Alert, Badge, Button as BsButton, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { useLocation } from 'react-router-dom';
import { DateRangePicker, Dropdown, Input, InputGroup, Pagination } from "rsuite";

import grid from "../config/grid";
import Auth from '../context/auth';
import ceiling from '../helpers/ceiling';
import download from "../helpers/download";
import print from "../helpers/print";
import textcase from '../helpers/textcase';

const Grid = ({ title, id = "default", realtime = false, options = { rows: 1, cols: 10, default: "No data" }, params = {} }) => {

    const { theme, user, domain } = Auth.getContext();
    const TableElement = React.useRef(null);
    const [search, setSearch] = React.useState("");
    const [searchInput, setSearchInput] = React.useState("");
    const [timeframe, setTimeframe] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const location = useLocation();
    const audience = location.pathname.split("/")[1].toString().toLowerCase();
    const tentative = {
        total: 0,
        header: Array.from({ length: options.cols }, (_, index) => {
            return { key: index.toString(), label: options.default, type: "text", required: true, options: { hidden: false, view: true, edit: true, strict: false } };
        }),
        body: Array.from({ length: options.rows }, (_, index) => {
            const obj = {};
            for (let i = 0; i <= options.rows - 1; i++) {
                obj[i] = options.default;
            }
            return obj;
        })
    }
    const [data, setData] = React.useState(tentative);
    const table = {
        total: (data.header.length > 0 ? data : tentative).total,
        label: grid[audience][id].label,
        api: grid[audience][id].api,
        options: grid[audience][id].options || {},
        actions: grid[audience][id].actions || [],
        eventhandler: grid[audience][id].onClick,
        header: (data.header.length > 0 ? data : tentative).header,
        body: (data.body.length > 0 ? data : tentative).body,
    }
    const [modal, setModal] = React.useState({
        visibility: false,
    });

    const preferences = {
        actions: {
            view: {
                variant: "primary",
                icon: "bi bi-eye-fill",
                rounded: false,
            },
            edit: {
                variant: "success",
                icon: "bi bi-pencil-square",
                rounded: false,
            },
            delete: {
                variant: "danger",
                icon: "bi bi-trash-fill",
                rounded: false,
            },
            accept: {
                variant: "success",
                icon: "bi bi-check-lg",
                rounded: true,
            },
            reject: {
                variant: "danger",
                icon: "bi bi-x-lg",
                rounded: true,
            },
        },
        props: {
            table: {
                current: {
                    id: id,
                    ref: TableElement,
                    variant: theme.value,
                    border: 1,
                    borderless: true,
                    striped: true,
                    responsive: true,
                    hover: true,
                    className: "flex-nowrap text-center align-middle text-nowrap mb-0",
                    "data-cols-width": Array.from({ length: table.header.filter(column => !column.options.strict).length }, () => 30),

                },
                container: {
                    span: {
                        colSpan: (table.header.length + 2),
                        className: "p-0 fw-normal",
                    },
                    alert: {
                        variant: (theme.value === "dark" ? "dark" : "light"),
                        className: "mb-0 border-0 rounded-0",
                    },
                },
                head: {
                    "data-f-sz": 14,
                    "data-f-bold": true,
                    "data-b-a-s": true,
                    "data-a-h": "center",
                    "data-a-v": "middle",
                },
                body: {
                    "data-f-sz": 12,
                    "data-b-a-s": true,
                    "data-a-h": "center",
                    "data-a-v": "middle",
                },
            },
            modal: {
                show: modal.visibility,
                onHide: () => setModal({ visibility: false }),
                backdrop: "static",
                keyboard: false,
                centered: true,
                scrollable: true,
                animation: true,
                size: "lg",
                fullscreen: "md-down",
            },
            pagination: {
                size: "xs",
                prev: true,
                next: true,
                first: false,
                last: false,
                ellipsis: false,
                boundaryLinks: false,
                maxButtons: 3,
                total: table.total,
                limit: limit,
                limitOptions: ceiling(table.total),
                activePage: page,
                onChangePage: setPage,
                onChangeLimit: setLimit,
                layout: [
                    "limit", "|", "skip", "-", "pager", "-",
                    <Dropdown {...{
                        key: "pagination-dropdown",
                        placement: "topEnd",
                        trigger: "click",
                        renderToggle: (props, ref) => (
                            <BsButton {...{
                                variant: "",
                                size: "sm",
                                className: "bx bxs-download px-1 fs-5 rounded-0",
                                type: "button",
                                title: "Download",
                                ref,
                                ...props,
                            }} />
                        )
                    }}>
                        {
                            [
                                { label: "Export as PNG", key: "png", onClick: () => download.png(TableElement.current, table.label) },

                                // {
                                //     label: "Export as CSV", key: "csv", onClick: () => download.csv({
                                //         data: table.body.map(item => Object.keys(item).filter(key => table.header.some(header => header.key === key)).map(key => item[key])),
                                //         filename: String(table.label), delimiter: ",", headers: Object.keys(table.body[0]).filter(key => table.header.some(header => header.key === key))
                                //     })
                                // },

                                { label: "Export as XLSX", key: "xlsx", onClick: () => download.xlsx(TableElement.current, { name: String(table.label || "export").concat(".xlsx"), sheet: "Sheet 1" }) },

                            ].filter(data => (Object.keys(data).length > 0)).map(data => (
                                <Dropdown.Item {...{
                                    key: data.key,
                                    onClick: data.onClick,
                                }}>{data.label}</Dropdown.Item>
                            ))
                        }
                    </Dropdown>,
                    "|",
                    <BsButton {...{
                        key: "pagination-print",
                        type: "button",
                        className: "bx bxs-printer px-1 fs-5 rounded-0",
                        variant: "",
                        size: "sm",
                        title: "Print",
                        onClick: () => print(TableElement.current),
                    }} />,
                    "|",
                    ...(!realtime ?
                        [
                            <BsButton {...{
                                key: "pagination-refresh",
                                type: "button",
                                className: "fa-solid fa-arrow-rotate-right",
                                variant: "",
                                size: "sm",
                                title: "Refresh",
                                onClick: () => {
                                    setSearch(null || undefined);
                                },
                            }} />,
                            "|",
                        ] : []
                    ),
                    <DateRangePicker {...{
                        key: "pagination-timeframe",
                        disabled: table.options.disableTimeframe || false,
                        showOneCalendar: true,
                        onChange: setTimeframe,
                        placement: "topEnd",
                        placeholder: "Timeframe",
                        className: "",
                        size: "xs",
                        onClean: () => setTimeframe([]),
                        style: {
                            width: "160px",
                        },

                    }} />,
                ],
            },
        },
    };

    const get_data = async (data) => {
        try {
            console.log(domain.concat(table.api));
            const response = await axios.get(domain.concat(table.api), {
                params: Object.entries(data)
                    .reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
            });
            setData(response.data);
        } catch (error) {
            setData(tentative);
        }
    }

    React.useEffect(() => {
        const payload = {
            page,
            limit,
            search,
            timeframe: timeframe.map(date => Date.parse(date)).join("-"),
            ...params,
            ...(["bloodbank", "hospital"].includes(audience) ? { [audience.concat("_id")]: user.id } : {}),
        };

        get_data(payload);

        if (realtime) {
            const loop = setInterval(() => {
                get_data(payload);
            }, 5000);

            return () =>
                clearTimeout(loop);
        }
        // eslint-disable-next-line
    }, [page, limit, search, timeframe, user]);

    React.useEffect(() => {
        return setPage(1);
    }, [limit, search]);

    return (
        <Alert variant="" className="mb-0 p-0 rounded-0 mb-3">
            <Table {...preferences.props.table.current}>
                <thead className="fs-5">
                    <tr className="text-start" data-exclude={true}>
                        <th {...preferences.props.table.container.span}>
                            <Alert {...preferences.props.table.container.alert}>
                                <Row className="d-flex align-items-center fs-6">
                                    <Col>
                                        <div className="text-uppercase">
                                            Category: <span className="fw-bold text-uppercase">
                                                {table.label || title}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="text-uppercase">
                                            Records: <span className="fw-bold">
                                                {(page * limit <= table.total) ? (page * limit) : table.total}/{table.total}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="text-uppercase">
                                            Page: <span className="fw-bold">
                                                {page}/{Math.round(table.total > 0 ? (table.total / Math.min(table.total, limit)) : page)}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col>
                                        <InputGroup size="sm" inside>
                                            <Input type="text" placeholder="Search" value={searchInput} disabled={table.options.disableSearch || false} onChange={setSearchInput} onKeyDown={
                                                (e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        setSearch(searchInput);
                                                    } else if (e.key === "Backspace" && searchInput.length === 1) {
                                                        setSearch(null);
                                                    }
                                                }} />
                                            <InputGroup.Button
                                                disabled={table.options.disableTimeframe || false}
                                                onClick={
                                                    (e) => {
                                                        if (e.type === "click") {
                                                            e.preventDefault();
                                                            setSearch(searchInput);
                                                        }
                                                    }}>
                                                <SearchIcon />
                                            </InputGroup.Button>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Alert>
                        </th>
                    </tr>
                    <tr className="text-center table-dark">
                        {
                            table.actions.includes("delete") && (
                                <th>
                                    <BsButton {...{
                                        className: "bg-transparent border-0 text-danger fa-solid fa-trash",
                                        onClick: () => null,
                                    }} />
                                </th>
                            )
                        }
                        {
                            table.header.filter(header => !header.options.hidden).map(column => (
                                <th key={column.key} {...(column.options.strict ? { "data-exclude": true } : { ...preferences.props.table.head })}>{column.label}</th>
                            ))
                        }
                        {
                            table.actions.filter(data => (data !== "" && data !== null)).length > 0 && (
                                <th className="text-capitalize" data-exclude={true}>Actions</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        table.body.map((row, index) => (
                            <tr {...{ key: index, title: "", className: "fs-6" }}>
                                {
                                    table.actions.includes("delete") && (
                                        <td data-exclude={true}>
                                            <Form.Check {...{
                                                type: "checkbox",
                                                name: "row[]",
                                                className: "",
                                                defaultValue: row._id || "",
                                            }} />
                                        </td>
                                    )
                                }
                                {
                                    table.header.filter(data => !data.options.hidden).map((column, iterate) => (
                                        <td key={iterate} {...(column.options.strict ? { "data-exclude": true } : { ...preferences.props.table.body })}>
                                            {
                                                ["status"].includes(column.key) ||
                                                    ["Status"].includes(column.label) ||
                                                    ["Active", "Approved", "Yes", "Declined", "No", "Inactive"].includes(row[column.key]) ?
                                                    (
                                                        <Badge bg={
                                                            ["Active", "Approved", "Yes"].includes(row[column.key]) ? "success" :
                                                                ["Declined", "No", "Inactive"].includes(row[column.key]) ? "danger" : "primary"
                                                        }>
                                                            {row[column.key] || options.default}
                                                        </Badge>
                                                    ) : row[column.key] || options.default
                                            }
                                        </td>
                                    ))
                                }
                                {
                                    data.body.length > 0 ?
                                        (table.actions.filter(data => (data !== "" && data !== null)).length > 0 && (
                                            <td data-exclude={true}>
                                                {
                                                    table.actions.filter(data => (data !== "" && data !== null)).map(act => (
                                                        <BsButton {...{
                                                            type: "button",
                                                            key: act,
                                                            variant: preferences.actions[act].variant,
                                                            className: ["p-1", "fs-6", "ms-1", preferences.actions[act].icon, (preferences.actions[act].rounded ? "rounded-pill" : "")].join(" "),
                                                            title: textcase("sentence", act),
                                                            onClick: () => {
                                                                const processedValues = table.eventhandler(act, row, table, user, setModal, domain) || {};

                                                                if (processedValues.modal) {
                                                                    setModal(processedValues.modal);
                                                                }
                                                            }
                                                        }} />
                                                    ))
                                                }
                                            </td>
                                        ))
                                        :
                                        (
                                            <td>
                                                {options.default}
                                            </td>
                                        )
                                }
                            </tr>
                        ))

                    }
                    {
                        <tr className="text-start" data-exclude={true}>
                            <td {...preferences.props.table.container.span}>
                                <Alert {...preferences.props.table.container.alert}>
                                    <Pagination {...preferences.props.pagination} />
                                </Alert>
                            </td>
                        </tr>
                    }
                </tbody>
            </Table>
            {
                modal.visibility && (
                    <Modal {...preferences.props.modal}>
                        <Modal.Header className="border-0 text-center" closeButton>
                            <Modal.Title className="fs-4">{modal.title}</Modal.Title>
                        </Modal.Header>
                        {
                            modal.html
                        }
                    </Modal>
                )
            }
        </Alert >
    );
}

export default Grid;