import React from "react";
import { Alert, ButtonGroup, Col, Row } from 'react-bootstrap';

import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";

const Dashboard = () => {

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
                                <Popup.AddEvent />
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
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
                                    {/*! FIXME: No backend */}
                                    <Statistic.Total label="Total Donor Yearly" variant="primary" api="api/t/donor/total" />
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    {/* FIXME: No backend */}
                                    <Statistic.Total label="Total Request Yearly" variant="success" api="api/t/request/total" />
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Events Yearly" variant="danger" api="api/t/event/total" />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <Statistic.Graph label="Bleed Forecasting" actions={true} realtime={true} analysis={true} api="api/c/bleed/forecast" />
                                </Col>
                            </Row>
                        </Col>
                        <Col sm={12} md={4} lg={3}>
                            <Alert variant="light" className="">
                                {/* Graph: Pie */}
                                <Statistic.Graph type="pie" label="Donor by Blood Type" actions={false} realtime={true} transparent={true} api="api/c/bleed/bloodtype" />
                            </Alert>
                            <Alert variant="light" className="">
                                {/* Graph: Line */}
                                <Statistic.Graph type="bar" label="Bleed vs Screened" actions={false} realtime={true} transparent={true} api="api/c/bleed/screened" />
                            </Alert>
                            <Alert variant="light" className="">
                                {/* Graph: Bar */}
                                <Statistic.Graph type="bar" label="Donor by Gender" actions={false} realtime={true} transparent={true} api="api/c/donor/gender" />
                            </Alert>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
}

export default Dashboard;