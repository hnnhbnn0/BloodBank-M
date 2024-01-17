

const Progress = ({ label, size, api, percentage = false, transparent = false, date = "month", }) => {

    const accent = preferences.background.accent;
    const primary = preferences.background.color;

    const [data, setData] = React.useState({
        max: {
            total: 5000,
            date: new Date().toDateString(),
        },
        current: {
            total: 500,
            date: new Date().toDateString(),
        },
        previous: {
            total: 1250,
            date: new Date().toDateString(),
        },
    });

    const criteria = {
        color: ["danger", "info"],
        tabs: ["current", "previous"],
        data: ["date", "total"],
    };

    const overlay = (type, variant) => ({
        trigger: "click",
        placement: "bottom",
        rootClose: true,
        overlay: (
            <Popover>
                <Popover.Header className={[
                    "text-capitalize",
                    "fs-6",
                    (criteria.color.includes(variant) ? "text-light" :
                        [""].includes(variant) ? "text-dark" : ""),
                    ("bg-" + variant)]}>{type} {date.toLowerCase()} information</Popover.Header>
                <Popover.Body>
                    {
                        Object.entries(data[type])
                            .filter(([key]) => criteria.data.includes(key))
                            .sort(([key1], [key2]) => key1.localeCompare(key2))
                            .map((item, index) => (
                                <div key={index} className="d-flex justify-content-between">
                                    {
                                        item.map((data, index) => (
                                            <div key={index} className="fs-6 text-capitalize">{data}</div>
                                        ))
                                    }
                                </div>
                            ))
                    }
                    {
                        criteria.tabs.includes(type) && (
                            <div key="percentage" className="d-flex justify-content-between">
                                <div className="fs-6 text-capitalize">Percentage</div>
                                <div className="fs-6 text-capitalize">{Number(data[type].total / data.max.total * 100).toFixed(2).concat("%")}</div>
                            </div>
                        )
                    }
                    {
                        Object.entries(data[type])
                            .filter(([key]) => !criteria.data.includes(key))
                            .length > 0 && (<hr />)
                    }
                    {
                        Object.entries(data[type])
                            .filter(([key]) => !criteria.data.includes(key))
                            .sort(([key1], [key2]) => key1.localeCompare(key2))
                            .map((item, index) => (
                                <div key={index} className="d-flex justify-content-between">
                                    {
                                        item.map((data, index) => (
                                            <div key={index} className="fs-6 text-capitalize">{data}</div>
                                        ))
                                    }
                                </div>
                            ))
                    }

                </Popover.Body>
            </Popover >
        ),
    });

    const get_data = async () => {
        try {
            // const response = await axios.get(api + "?progress");
            // console.log(response.data);

            setData({
                max: {
                    total: 1,
                    date: new Date().toDateString(),
                },
                current: {
                    total: Math.round(Math.random() * 1),
                    screened: 100,
                    bleed: 50,
                    date: new Date().toDateString(),
                },
                previous: {
                    total: Math.round(Math.random() * 1),
                    date: new Date().toDateString(),
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    React.useEffect(() => {
        get_data();

        const loop = setInterval(() => {
            get_data();
        }, 5000);

        return () =>
            clearInterval(loop);
    }, []);

    // ***** This is a filter function for percentage ******| - const filter_as = (key, total) => ["percentage"].map(data => (data.includes(key) ? total.toFixed(2).concat("%") : total))[0];

    // console.log((((data.current === data.max) && (data.previous === data.max)) ?
    //     { style: { background: method.color([accent, primary], "gradient", { type: "linear" }) } } :
    //     (
    //         (data.current > data.previous) ?
    //             (data.current === data.max ? { bg: primary } : { bg: "secondary-subtle" }) :
    //             (data.previous === data.max ? { bg: accent } : { bg: "secondary-subtle" })
    //     )
    // ))
    return (
        <Alert variant={transparent ? "" : "light"} className={[transparent ? "p-0 m-0 mb-3" : "", "fs-6", "shadow-md"].join(" ")}>
            <div className="d-flex justify-content-between mb-2">
                <div className="fs-5 fw-bold">{label}</div>
                <OverlayTrigger {...overlay("max")}>
                    <div className="d-flex align-items-center" role="button">
                        <Badge {...{
                            dangerouslySetInnerHTML: { __html: data.max.total },
                            className: "fs-6 text-transparent",
                            bg: "secondary-subtle",
                            /*
                            ! WRONG SNIPPET FOR BG
                            ...(((data.current === data.max) && (data.previous === data.max)) ?
                                { style: { background: method.color([accent, primary], "gradient", { type: "linear" }) } } :
                                (
                                    (data.current > data.previous) ?
                                        (data.current === data.max ? { bg: primary } : { bg: "secondary-subtle" }) :
                                        (data.previous === data.max ? { bg: accent } : { bg: "secondary-subtle" })
                                )
                            )
     
                            */

                            // ...(((data.current === data.max) && (data.previous === data.max)) ?
                            //     { style: { background: method.color([accent, primary], "gradient", { type: "linear" }) } } :
                            //     (
                            //         (data.current > data.previous) ?
                            //             (data.current === data.max ? { bg: primary } : { bg: "secondary-subtle" }) :
                            //             (data.previous === data.max ? { bg: accent } : { bg: "secondary-subtle" })
                            //     )
                            // )
                            /*
                                (data.current === data.previous === max) ? gradient : (data.current > data.previous ? (data.current === data.max ? primary : secondary) : (data.previous === data.max ? info : secondary))
                                 
                                (data.current === data.previous !== max ? secondary) ?

                                current > previous ---> primary
                                previous < current ---> info
                                previous === max ---> info
                                current === max ---> primary
                                current === previous === max ---> gradient
                            */
                            // bg: data.current.total > data.previous.total ?
                            //     (data.current.total >= data.max.total ? accent : "secondary-subtle") :
                            //     (data.previous.total >= data.max.total ? primary : "secondary-subtle"),
                            // ...(data.current.total === data.previous.total ?
                            // { style: { background: method.color([accent, primary], "gradient", { type: "linear" }) } }
                            //     :
                            //     {
                            //         bg: data.current.total > data.previous.total ?
                            //             (data.current.total >= data.max.total ? accent : "secondary-subtle") :
                            //             (data.previous.total >= data.max.total ? primary : "secondary-subtle"),
                            //     }
                            // ),

                            // ! WRONG LOGIC
                            // ...((data.max.total === data.current.total) && (data.current.total === data.max.total) && (data.previous.total !== data.max.total) ?
                            //     {
                            //         bg: primary
                            //     } :
                            //     (
                            //         (data.max.total === data.previous.total) && (data.current.total !== data.max.total) && (data.previous.total === data.max.total) ?
                            //             { bg: accent, } :
                            //             (data.current.total === data.previous.total && ((data.current.total === data.previous.total) === data.max.total)) ?
                            //                 { style: { background: method.color([accent, primary], "gradient", { type: "linear" }) } } :
                            //                 { bg: "secondary-subtle" }
                            //     )
                            // )
                        }} />
                        <div className="fs-6 ms-1">Highest</div>
                    </div>
                </OverlayTrigger>
            </div>
            <div className="d-block mb-2">
                <ProgressBar className={size}>
                    <ProgressBar {...{
                        animated: true,
                        max: data.max.total,
                        min: 0,
                        now: Math.min(data.current.total, data.previous.total),
                        label: percentage ? Number(
                            data.current.total > data.previous.total ?
                                (data.previous.total / data.max.total * 100) :
                                (data.current.total / data.max.total * 100)
                        ).toFixed(2).concat("%") : null,
                        ...(data.current.total === data.previous.total ?
                            { style: { background: color([accent, primary], "gradient", { type: "linear" }) } }
                            :
                            { variant: data.current.total < data.previous.total ? primary : accent }
                        ),
                        // ? [default] variant: data.current.total < data.previous.total ? primary : accent
                    }} />
                    <ProgressBar {...{
                        animated: true,
                        max: data.max.total,
                        min: 0,
                        now: Math.abs(data.current.total - data.previous.total),
                        variant: data.current.total > data.previous.total ? primary : accent,
                        label: percentage ? Number(
                            data.current.total < data.previous.total ?
                                (data.previous.total / data.max.total * 100) :
                                (data.current.total / data.max.total * 100)
                        ).toFixed(2).concat("%") : null,
                    }} />
                </ProgressBar>
            </div>
            <div className="d-flex justify-content-between">
                <OverlayTrigger {...overlay("current", primary)}>
                    <div className="d-flex align-items-center" role="button">
                        <Badge bg={primary} className="fs-6 rounded-1">{data.current.total}</Badge>
                        <div className="fs-6 ms-1">This {date.toLowerCase()}</div>
                    </div>
                </OverlayTrigger>
                <OverlayTrigger {...overlay("previous", accent)}>
                    <div className="d-flex align-items-center" role="button">
                        <Badge bg={accent} className="fs-6 rounded-1">{data.previous.total}</Badge>
                        <div className="fs-6 ms-1">Last {date.toLowerCase()}</div>
                    </div>
                </OverlayTrigger>
            </div>
        </Alert >
    )
};

export default Progress;