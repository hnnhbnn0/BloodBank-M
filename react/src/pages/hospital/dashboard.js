import React from "react";
import { Alert, ButtonGroup, Col, Row } from 'react-bootstrap';

import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";

const Dashboard = () => {

    const currentYear = new Date().getFullYear();

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
                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <Alert variant="light" className="">
                                        <div className="fs-4 mb-2 fw-semibold">Dashboard</div>
                                        <div className="fs-6">Uncover critical insights and trends, explore detailed requisition patterns, and gain a comprehensive understanding of blood allocation dynamics within the Dashboard.</div>
                                    </Alert>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Pending" variant="primary" api="api/t/request/pending" />
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Approved" variant="success" api="api/t/request/approved" />
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    <Statistic.Total label="Total Declined" variant="danger" api="api/t/request/declined" />
                                </Col>

                            </Row>
                            <Row>
                                <Col sm={12} md={12} lg={12}>

                                    <Statistic.Graph type="bar" label={`${currentYear} Total Request`} realtime={true} api="api/c/request/total" />
                                </Col>
                            </Row>
                        </Col>
                        <Col sm={12} md={4} lg={3}>
                            <Alert variant="light" className="">
                                {/* Graph: Pie */}
                                <Statistic.Graph type="pie" label="Request by Blood Type" actions={false} realtime={true} transparent={true} api="api/c/request/bloodtype" />
                            </Alert>
                            <Alert variant="light" className="">
                                {/* Graph: Line */}
                                <Statistic.Graph type="bar" label="Approved vs Declined" actions={false} realtime={true} transparent={true} api="api/c/request/status" />
                            </Alert>
                            <Alert variant="light" className="">
                                {/* Graph: Bar */}
                                <Statistic.Graph type="bar" label="Blood Bag Quantity by Month" actions={false} realtime={true} transparent={true} api="api/c/request/bloodbag" />
                            </Alert>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container >
    );
}

export default Dashboard;