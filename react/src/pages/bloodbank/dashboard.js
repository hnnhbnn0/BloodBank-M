import React from "react";
import Sidebar from "../../components/Sidebar";
import { Alert, Row, Col, ButtonGroup } from "react-bootstrap";
import Popup from "../../components/Popup";
import Statistic from "../../components/Stats";

const Dashboard = () => {

    /**
     * Charts of the total donation, their number of events, and number of their doors.
     * Pie charts per bloodtype.
     * Expected future donations
     */

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
                        <Col sm={12} md={8} lg={9}>
                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <Alert variant="light" className="">
                                        <div className="fs-4 mb-2 fw-semibold">Dashboard</div>
                                        <div className="fs-6">Elevate your insights with real-time analytics on bleed forecasting, blood types, and donor demographics. Explore trends, monitor annual donor and request statistics, and glean strategic insights for informed planning. Effortlessly navigate through a user-friendly interface that brings comprehensive data visualization to your fingertips.</div>
                                    </Alert>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Donor Yearly" variant="primary" api="api/t/donor/total" />
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Request Yearly" variant="success" api="api/t/request/total" />
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Events Yearly" variant="danger" api="api/t/event/total" />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <Statistic.Graph type="bar" label="Donation Activity" realtime={true} api="api/c/donation/activity" />
                                </Col>
                            </Row>
                        </Col>
                        <Col sm={12} md={4} lg={3}>
                            <Alert variant="light" className="">
                                <Statistic.Graph type="pie" label="Donor by Blood Type" actions={false} realtime={true} transparent={true} api="api/c/bleed/bloodtype" />
                            </Alert>
                            <Alert variant="light" className="">
                                <Statistic.Graph type="bar" label="Requests: Approved vs Declined" actions={false} realtime={true} transparent={true} api="api/c/approved/declined" />
                            </Alert>
                            <Alert variant="light" className="">
                                <Statistic.Graph type="bar" label="Bleed vs Screened" actions={false} realtime={true} transparent={true} api="api/c/bleed/screened" />
                            </Alert>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
};

export default Dashboard;