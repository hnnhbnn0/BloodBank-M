import React from "react";
import Sidebar from "../../components/Sidebar";
import { Alert, Row, Col, Tab, Tabs } from "react-bootstrap";
import Statistic from "../../components/Stats";

const Request = () => {

    /**
     * Table of the pending blood requests to them.
     */

    return (
        <Sidebar.Container>
            <Sidebar.Toggle />
            <Sidebar.Layout>
                <Sidebar.Navigation />
                <Sidebar.Content>
                    <Row className="mb-3">
                        <Col sm={12} md={8} lg={8}>
                            <Sidebar.Search />
                        </Col>
                        <Col sm={12} md={4} lg={4}>

                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={8} lg={8}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Request</div>
                                <div className="fs-6">Elevate your insights with real-time analytics on bleed forecasting, blood types, and donor demographics. Explore trends, monitor annual donor and request statistics, and glean strategic insights for informed planning. Effortlessly navigate through a user-friendly interface that brings comprehensive data visualization to your fingertips.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="pending" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="pending" title="Pending Requests">
                                        <Statistic.Grid id="request-pending" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="approved" title="Approved Requests">
                                        <Statistic.Grid id="request-approved" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="declined" title="Declined Requests">
                                        <Statistic.Grid id="request-rejected" realtime={true} />
                                    </Tab>
                                </Tabs>
                            </Alert>
                        </Col>
                        <Col sm={12} md={4} lg={4}>
                            <Row>
                                <Col>
                                    <Alert variant="light">
                                        <Statistic.Graph type="bar" label="Blood Types Availability" actions={false} realtime={true} transparent={true} stacked={true} api="api/c/blood/availability" />
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

export default Request;