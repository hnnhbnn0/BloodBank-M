import axios from "axios";
import React from "react";
import { Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import Auth from "../context/auth";

const Total = ({ variant = "light", label = "No label", api = "", realtime = true, params = {} }) => {
    const { user, domain } = Auth.getContext();
    const tentative = { value: 0, status: "No status" };
    const [data, setData] = React.useState(tentative);
    const location = useLocation();
    const audience = location.pathname.split("/")[1].toString().toLowerCase();

    const get_data = async (user) => {
        try {
            const response = await axios.get(domain.concat(api), {
                params: {
                    ...params,
                    ...(["bloodbank", "hospital"].includes(audience) ? { [audience.concat("_id")]: user.id } : {}),
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
    }, [realtime, user]);


    return (
        <React.Fragment>
            <Alert variant="" className={`py-2 d-flex bg-${variant} justify-content-between align-items-center align-content-center border-0 rounded-0 rounded-top mb-0`}>
                <div className="vstack gap-1">
                    <div className="fs-6 fw-bold font-monospace">Overall Records</div>
                </div>
                <div className="fw-bold fs-6 p-0 m-0">{data.overall}</div>
            </Alert>
            <Alert variant={variant} className="d-flex justify-content-between align-items-center align-content-center border-0 rounded-0 rounded-bottom">
                <div className="vstack gap-1">
                    <div className="fs-5 fw-bold">{label || "No data"}</div>
                    <div className="fs-6">{data.status || "No data"}</div>
                </div>
                <div className="fw-bold fs-2 p-0 m-0">{data.current}</div>
            </Alert>
        </React.Fragment>
    );
}

export default Total;