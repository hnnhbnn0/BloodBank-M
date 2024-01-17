import React from "react";
import Sidebar from "../../components/Sidebar";
import { Alert, Row, Col, Tab, Tabs } from "react-bootstrap";
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
                    <Row className="mb-3">
                        <Col sm={12} md={12} lg={12}>
                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <Alert variant="light" className="">
                                        <div className="fs-4 mb-2 fw-semibold">Reports</div>
                                        <div className="fs-6">Elevate your insights with real-time analytics on bleed forecasting, blood types, and donor demographics. Explore trends, monitor annual donor and request statistics, and glean strategic insights for informed planning. Effortlessly navigate through a user-friendly interface that brings comprehensive data visualization to your fingertips.</div>
                                    </Alert>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <Alert variant="light" className="">
                                        <Tabs variant="underline" defaultActiveKey="donor" className="mb-2 py-2 fs-5" fill>
                                            <Tab eventKey="donor" title="Donors">
                                                <Statistic.Grid id="donor-result" realtime={true} />
                                            </Tab>
                                            <Tab eventKey="event" title="Events">
                                                <Statistic.Grid id="event-result" realtime={true} />
                                            </Tab>
                                            <Tab eventKey="request" title="Requests">
                                                <Statistic.Grid id="request-report" realtime={true} />
                                            </Tab>
                                        </Tabs>
                                    </Alert>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
};

export default Reports;