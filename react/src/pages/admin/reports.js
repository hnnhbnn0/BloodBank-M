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
                    <Row>
                        <Col sm={12} md={12} lg={12}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Reports</div>
                                <div className="fs-6">Access valuable insights into event outcomes and the status of blood requests. Enhance monitoring and evaluation capabilities for data-driven decision-making. The Web-based Blood Donation Management System with Forecasting Model ensures user-friendly efficiency in optimizing blood donation processes. Dive deep into detailed reports that aid in continuous improvement and strategic planning.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="schedule" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="schedule" title="Events">
                                        <Statistic.Grid id="event-result" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="request" title="Donors">
                                        <Statistic.Grid id="donor-result" realtime={true} />
                                    </Tab>
                                </Tabs>
                            </Alert>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
}

export default Reports;