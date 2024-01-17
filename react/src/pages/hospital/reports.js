import React from "react";
import { Alert, Col, Row, Tab, Tabs } from 'react-bootstrap';

import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";

const Reports = () => {

    return (
        <Sidebar.Container>
            <Sidebar.Toggle />
            <Sidebar.Layout>
                <Sidebar.Navigation />
                <Sidebar.Content>
                    <Row className="mb-3">
                        <Col sm={12} md={12} lg={12}>
                            <Sidebar.Search />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={12} lg={12}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Reports</div>
                                <div className="fs-6">Uncover invaluable insights! Explore these reports to fine-tune your blood management strategy. Get ahead by deciphering trends, optimizing inventory, and streamlining processes. Your ticket to swift, precise responses aligning perfectly with patient needs.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="report" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="report" title="Blood Request Report">
                                        <Statistic.Grid id="request-report" realtime={true} />
                                    </Tab>

                                </Tabs>
                            </Alert>
                        </Col>
                        {/* <Col sm={12} md={4} lg={3}>
                            <Alert variant="light" className="vh-100">
                                <div className="fs-4 mb-2 fw-semibold">Facts</div>
                                <div className="fs-6">Get insights on blood management with line graphs for blood requests and available blood bags, a pie graph for blood type distribution, and details on blood bags and types.</div>
                            </Alert>
                        </Col> */}
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
}

export default Reports;