import React from "react";
import { Alert, ButtonGroup, Col, Row, Tab, Tabs } from 'react-bootstrap';
import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";

const Request = () => {

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
                                <Popup.AddBloodbank />
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={8} lg={12}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Hospitals</div>
                                <div className="fs-6">Manage hospital accounts with ease. Create new accounts and ensure their activation status is effectively handled for a seamless user experience. Simplify administrative tasks, ensuring hospitals can focus on providing quality healthcare without unnecessary administrative burdens.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="active-bloodbank" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="active-bloodbank" title="Active Bloodbank">
                                        <Statistic.Grid id="bloodbank-active" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="inactive-bloodbank" title="Inactive Bloodbank">
                                        <Statistic.Grid id="bloodbank-inactive" realtime={true} />
                                    </Tab>
                                </Tabs>
                            </Alert>
                        </Col>
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container>
    );
}

export default Request;