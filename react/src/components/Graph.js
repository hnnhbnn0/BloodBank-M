import axios from "axios";
import Chart from 'chart.js/auto';
import React from "react";
import { Alert, Badge, Button as BsButton, ButtonGroup, OverlayTrigger, Popover, Table } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    DoughnutController,
    LineController,
    LineElement,
    LinearScale,
    PieController,
    PointElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import preferences from "../config/preferences";
import Auth from '../context/auth';
import download from "../helpers/download";


Chart.register(
    ChartDataLabels,
    LineController,
    BarController,
    DoughnutController,
    PieController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement
);

const Graph = ({ label, type = "line", api, analysis = false, transparent = false, variant, stacked = false, table = true, border = 1, realtime = false, actions = false, params = {} }) => {

    const CanvasElement = React.useRef(null);
    const ChartElement = React.useRef(null);
    const AlertElement = React.useRef(null);
    const TableElement = React.useRef(null);

    const { theme, user, domain } = Auth.getContext();
    const location = useLocation();
    const audience = location.pathname.split("/")[1].toString().toLowerCase();
    const palette = theme.value === "light" ? preferences.palette.redviolet : preferences.palette.waveform;

    const [isCanvas, setIsCanvas] = React.useState(true); // 1 - canvas, 0 - xlsx

    const tentative = {
        spreadsheet: {
            header: [],
            body: [],
        },
        labels: [

        ],
        datasets: [

        ],
    }
    const [data, setData] = React.useState(tentative);

    const overlay = () => ({
        trigger: "click",
        placement: "top",
        rootClose: true,
        overlay: (
            <Popover>
                <ButtonGroup vertical className="text-start">
                    {
                        [
                            (isCanvas && { label: "Export as JPEG", key: "export-jpeg", variant: "", onClick: () => download.jpg(AlertElement.current, label), }),
                            (isCanvas && { label: "Export as PNG", key: "export-png", variant: "", onClick: () => download.png(CanvasElement.current, label), }),
                            (!isCanvas && { label: "Export as XLSX", key: "export-xlsx", variant: "", onClick: () => download.xlsx(TableElement.current) })
                        ].filter(data => (Object.keys(data).length > 0)).map(data => (
                            <BsButton {...{
                                key: data.key,
                                className: "fs-6",
                                variant: data.variant,
                                onClick: data.onClick,
                                dangerouslySetInnerHTML: { __html: data.label },
                            }} />
                        ))
                    }
                </ButtonGroup>
            </Popover>
        ),
    });

    const options = (type) => {

        const plugins = {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 10,
                    },
                },
                datalabels: {
                    display: true,
                    align: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    color: theme.value === "light" ? "#000" : "#fff",
                    borderRadius: 0,
                    font: {
                        size: 9,
                        family: "Euclid Circular A",
                    },
                },
            },
        }

        const barLine = {
            scales: {
                x: {
                    ...(stacked ? { stacked: true } : {}),
                    type: 'category',
                    grid: {
                        display: false,
                    },
                },
                y: {
                    ...(stacked ? { stacked: true } : {}),
                    beginAtZero: true,
                    grid: {
                        display: false,
                    },
                },
            },
            ...plugins,
        }

        const doughnutPie = {
            ...plugins,
        }

        switch (type) {
            case "bar":
                return barLine;
            case "doughnut":
                return doughnutPie;
            case "line":
                return barLine;
            case "pie":
                return doughnutPie;
            default:
                return plugins;
        }
    }

    const get_data = async (user) => {
        try {
            const response = await axios.get(domain.concat(api), {
                params: {
                    ...(["bloodbank", "hospital"].includes(audience) ? { [audience.concat("_id")]: user.id } : {}),
                    ...params,
                }
            });
            setData(response.data);
        } catch (error) {
            setData(tentative);
        }
    }

    React.useEffect(() => {
        get_data(user);

        if (realtime) {
            const loop = setInterval(() => {
                get_data(user);
            }, 5000);

            return () =>
                clearInterval(loop);
        }
        // eslint-disable-next-line
    }, [user]);

    React.useEffect(() => {

        ChartElement.current = new Chart(CanvasElement.current, {
            type,
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, index) => ({
                    ...dataset,
                    borderColor: palette,
                    backgroundColor: ["line", "bar"].includes(type) ? palette[index] : palette,
                    pointBackgroundColor: palette[index],
                    pointBorderColor: palette[index],
                    cubicInterpolationMode: false ? 'monotone' : 'linear',
                    // fill: true,
                    // stack: 'stack'
                })),
            },
            options: {
                ...options(type),
                maintainAspectRatio: true,
                responsive: true,
                animation: (
                    false ? {} : {
                        duration: 0,
                    }
                ),
            }
        })

        return () => {
            if (ChartElement.current) {
                ChartElement.current.destroy();
            }
        };
        // eslint-disable-next-line
    }, [isCanvas, data, theme]);

    return (
        <Alert ref={AlertElement} variant={transparent ? "" : "light"} className={[transparent ? "p-0 m-0 mb-3" : "fs-6", "shadow-md", (border ? "border-" + border : "border-0")].join(" ")}>
            <div className="d-flex justify-content-between mb-2">
                <div className="fs-5 fw-bold">{label} {data.status && analysis && (
                    <Badge className="fw-bolder btn-dynamic bg-danger">{data.status}</Badge>
                )}</div>
                {
                    actions && (
                        <div>
                            <ButtonGroup>
                                <BsButton key="table-canvas" variant="danger" size="sm" className={[table ? "d-block" : "d-none", "fs-6", "btn-dynamic"].join(" ")} onClick={() => setIsCanvas(!isCanvas)}>{isCanvas ? "Table" : "Graph"}</BsButton>
                                <OverlayTrigger {...overlay()}>
                                    <BsButton key="table-export" variant="danger" size="sm" className="bi bi-three-dots fs-6 btn-dynamic" />
                                </OverlayTrigger>
                            </ButtonGroup>
                        </div>
                    )
                }
            </div>
            <div className="fs-6 mb-2 fst-italic">
                {analysis && (data.analysis || "No forecast analysis available")}
            </div>
            <div className="d-block text-center align-items-center">
                <canvas ref={CanvasElement} className={`${isCanvas ? "d-block" : "d-none"} ${type}`} />
                <Table ref={TableElement} striped hover responsive variant={variant} className={[isCanvas ? "d-none" : "", "w-100", "mb-0", "fs-6", "border", "border-1", "mb-2"].join(" ")}>
                    <thead className="fs-6 table-dark">
                        <tr>
                            {
                                data.spreadsheet.header.map((item) => (
                                    <th key={item.label}>{item.label}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.spreadsheet.body.map((row, index) => (
                                <tr key={index}>
                                    {
                                        data.spreadsheet.header.map((column, index) => (
                                            <td key={index}>{row[column.key] || "o o o"}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
        </Alert >
    );
};

export default Graph;