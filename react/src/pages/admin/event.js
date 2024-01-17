import React from "react";
import { Alert, ButtonGroup, Col, Row, Tab, Tabs } from 'react-bootstrap';

import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";

const Event = () => {

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
                                <Popup.ImportData />
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={8} lg={12}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Events</div>
                                <div className="fs-6">Organize blood donation events seamlessly. Add new events, upload outcomes, and access a neatly organized list of upcoming events and their results for efficient event management and analysis. Empower your team with a centralized hub for all event-related activities, ensuring a smooth and coordinated workflow.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="schedule" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="schedule" title="Event Schedule">
                                        <Statistic.Grid id="event-schedule" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="result" title="Event Results">
                                        <Statistic.Grid id="event-result" realtime={true} />
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

export default Event;