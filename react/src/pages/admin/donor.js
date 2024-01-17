import React from "react";
import { Alert, ButtonGroup, Col, Row, Tab, Tabs } from 'react-bootstrap';

import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";
import Statistic from "../../components/Stats";

const Donor = () => {

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
                        <Col sm={12} mc={4} lg={3}>
                            <ButtonGroup className="w-100">
                                <Popup.ImportDonorsData />
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={8} lg={12}>
                            <Alert variant="light" className="">
                                <div className="fs-4 mb-2 fw-semibold">Donor</div>
                                <div className="fs-6">Streamline donor information management. Upload donor details effortlessly, view a user-friendly donor information table, and discover exceptional donors on a leaderboard based on specific criteria. Facilitate efficient communication and engagement with donors while ensuring their data is securely managed.</div>
                            </Alert>
                            <Alert variant="light" className="">
                                <Tabs variant="underline" defaultActiveKey="list" className="mb-2 py-2 fs-5" fill>
                                    <Tab eventKey="list" title="Donor Leaderboards">
                                        <Statistic.Grid id="donor-list" realtime={true} />
                                    </Tab>
                                    <Tab eventKey="results" title="Donor Results">
                                        <Statistic.Grid id="donor-result" realtime={true} />
                                    </Tab>
                                </Tabs>
                            </Alert>
                        </Col>
                        {/* <Col sm={12} md={4} lg={3}>
                            <Alert variant="light" className="vh-100">

                            </Alert>
                        </Col> */}
                    </Row>
                </Sidebar.Content>
            </Sidebar.Layout>
        </Sidebar.Container>
    )
}

export default Donor;