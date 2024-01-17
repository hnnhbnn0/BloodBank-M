import React from "react";
import axios from "axios";
import { Alert, ButtonGroup, Col, Row, Tab, Tabs } from 'react-bootstrap';

import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";
import Auth from "../../context/auth";

const Request = () => {

    const { domain } = Auth.getContext();

    const [data, setData] = React.useState([]);

    const get_data = async () => {
        try {
            const response = await axios.get(domain.concat("api/q/bloodbank/list"));

            setData(response.data.result);
        } catch (err) {
            setData([]);
        }
    }

    React.useEffect(() => {
        get_data();
    }, []);

    return (
        <Sidebar.Container>
            <Sidebar.Toggle />
            <Sidebar.Layout>
                <Sidebar.Navigation />
                <Sidebar.Content>
                    <Row className="mb-3">
                        <Col sm={12} md={8} lg={9}>
                            <Sidebar.Search />
                        </Col>
                        <Col sm={12} md={4} lg={3}>
                            <ButtonGroup className="w-100">
                                <Popup.AddRequest />
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={8} lg={9}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Requests</div>
                                <div className="fs-6">Uncover patient-specific details, real-time status updates, and precise requirements for timely blood bag allocations. It's your hub for swift and accurate communication, ensuring each patient's unique blood needs are met promptly.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="pending" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="pending" title="Pending">
                                        <Statistic.Grid id="request-pending" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="action" title="Action">
                                        <Statistic.Grid id="request-report" realtime={true} />
                                    </Tab>
                                </Tabs>
                            </Alert>
                        </Col>
                        <Col sm={12} md={4} lg={3}>
                            <Row>
                                {
                                    data.map(item => (
                                        <Col>
                                            <Alert variant="light">
                                                <Statistic.Graph type="bar" label={item.affiliation} actions={false} realtime={true} transparent={true} api="api/c/bleed/bloodbank" params={{ type: item.affiliation }} />
                                            </Alert>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
}

export default Request;