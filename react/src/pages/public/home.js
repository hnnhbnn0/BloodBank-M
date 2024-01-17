import axios from "axios";
import React from "react";
import { Accordion, Alert, Carousel, Col, Container, Image, Row } from "react-bootstrap";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import image from "../../config/image";
import Auth from "../../context/auth";

import "../../assets/styles/public.css";

const Home = () => {

    const { domain } = Auth.getContext();

    const [data, setData] = React.useState([]);
    const format = (str) => new Date(str);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const get_data = async () => {
        try {
            const response = await axios.get(domain.concat("api/g/event/schedule"), {
                params: {
                    page: 1,
                    limit: 12,
                }
            });
            setData(response.data.body);
        } catch (error) {
            setData([]);
        }
    }


    React.useEffect(() => {

        get_data();
        // eslint-disable-next-line 
    }, []);

    const steps = {
        1: "Registration and Checking of Temperature.",
        2: "Fill up the donor's questionnaire form.",
        3: "Have your blood pressure and weight taken.",
        4: "Physical assessment of physician.",
        5: "Checking of hemoglobin and blood type.",
        6: "Blood extraction.",
        7: "Rest for 10 minutes.",
    };

    const qualifications = {
        1: {
            en: "Age: 18 to 65 years old.",
            ph: "Edad: 18 hanggang 65 taong gulang.",
        },
        2: {
            en: "Weight: At least 110 pounds.",
            ph: "Bigat: Hindi kukulangin sa 110 pounds.",
        },
        3: {
            en: "Health: Must be in good health.",
            ph: "Kalusugan: Dapat nasa mabuting kalusugan.",
        },
        4: {
            en: "Blood Pressure: Should be within a normal range.",
            ph: "Presyon ng Dugo: Dapat nasa normal na antas.",
        },
        5: {
            en: "Pulse Rate: Should have a normal pulse rate.",
            ph: "Pulse Rate: Dapat may normal na bilis ng pulse.",
        },
        6: {
            en: "Hemoglobin Levels: Must have adequate levels.",
            ph: "Antas ng Hemoglobin: Dapat sapat ang antas.",
        },
        7: {
            en: "Travel: Consider recent travel history.",
            ph: "Paglalakbay: Tignan ang kamakailang kasaysayan ng paglalakbay.",
        },
        8: {
            en: "Medication: Disclose any medications or medical history.",
            ph: "Gamot: Ibigay ang impormasyon sa anumang gamot o kasaysayan ng karamdaman.",
        },
        9: {
            en: "Lifestyle: Recent tattoos or piercings may have deferral periods.",
            ph: "Estilo ng Buhay: Ang mga kamakailang tattoo o piercing ay maaaring magkaruon ng panahon ng paghihintay.",
        },
        10: {
            en: "Pregnancy: Pregnant women are deferred.",
            ph: "Buntis: Ang mga buntis ay hindi maaaring magbigay ng dugo.",
        },
    }

    const preparations = {
        1: {
            en: "Eat a Healthy Meal: Consume a nutritious meal before donating.",
            ph: "Kumain ng Malusog: Kumain ng masustansyang pagkain bago mag-donate.",
        },
        2: {
            en: "Stay Hydrated: Drink plenty of water to stay hydrated.",
            ph: "Mag-inom ng Tubig: Magtubig ng sapat para hindi magugutom.",
        },
        3: {
            en: "Get a Good Night's Sleep: Ensure you've had enough rest the night before.",
            ph: "Matulog ng Maayos: Siguruhing nakapagpahinga nang maayos ang gabi bago.",
        },
        4: {
            en: "Bring Identification: Have a valid ID for registration.",
            ph: "Magdala ng Valid ID: Magdala ng valid na ID para sa rehistrasyon.",
        },
        5: {
            en: "Wear Comfortable Clothing: Wear sleeves that can be easily rolled up.",
            ph: "Magsuot ng Kaukulang Damit: Magsuot ng damit na madaling ma-roll up ang manggas.",
        },
        6: {
            en: "Be Honest: Provide accurate information about your health.",
            ph: "Maging Tapat: Ibigay ang tamang impormasyon tungkol sa kalusugan.",
        },
        7: {
            en: "Avoid Alcohol: Refrain from consuming alcohol 24 hours before donation.",
            ph: "Iwasan ang Alak: Wag uminom ng alak 24 oras bago mag-donate.",
        },
        8: {
            en: "Postpone Exercise: Avoid strenuous exercise on the day of donation.",
            ph: "Huwag Mag-Exercise Bago: Iwasan ang mabigat na ehersisyo sa araw ng donation.",
        },
        9: {
            en: "Inform Staff: Let the donation staff know if you feel unwell during the screening.",
            ph: "I-inform ang Staff: Sabihan ang staff kung may nararamdaman na hindi kagandahan habang nasa screening.",
        },
    }

    return (
        <React.Fragment>
            <Header />
            <main>
                <section className="hero-container">
                    <div className="vertical-center">
                        <div className="text-container">
                            <div className="display-1 text-light fw-bolder m-0">
                                BE THE ONE WHO SAVES A LIFE.

                            </div>
                        </div>
                    </div>
                    <Image src={image.hero} className="hero-image" />
                    <div className="dark-filter" />
                </section>
                <section className="bg-danger text-light">
                    <Container className="py-5">
                        <div className="display-5 fw-bold">Discover the benefits of giving blood to someone.</div>
                    </Container>
                </section>
                <section className="" id="events">
                    <Container className="py-5">
                        <div className="display-6 fw-bold mb-5">Our past bloodletting events</div>

                        <Carousel className="vh-50 shadow shadow-lg rounded-3" fade>
                            {
                                image.donations.map((item, index) => (
                                    <Carousel.Item interval={1500} key={index} className="rounded-3">
                                        <Image src={item} className={`carousel-image rounded-3 ${index % 2 === 0 ? "with-text" : ""}`} />
                                        <Carousel.Caption>
                                            {/* <h3>First slide label</h3>
                                            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p> */}
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                ))
                            }
                        </Carousel>
                        <Row className="py-5 mb-3">
                            {
                                image.bloodlet.map((item, index) => (
                                    <Col lg={3} md={4} key={index} className="mb-4">
                                        <Image className="h-100 w-100 rounded-3 shadow" src={item} />
                                    </Col>
                                ))
                            }
                        </Row>
                    </Container>
                </section>
                <section className="bg-danger text-light" id="schedule">
                    <Container className="py-5">
                        <div className="display-5 fw-bold mb-5">Explore and attend our upcoming bloodletting events.</div>
                        <Row>
                            {
                                data.map((data, _index) => (
                                    <Col lg={2} className="d-flex flex-column">
                                        <div className="justify-content-center mb-5 text-center mx-auto">
                                            <Alert variant="warning" className="rounded-pill ratio-1x1 circle text-center lh-1">
                                                <div className="display-2 fw-bolder text-dark">{format(data.date).getDate()}</div>
                                                <div className="h5 fw-bolder text-uppercase mb-0">{months[format(data.date).getMonth()]}</div>
                                                <div className="h6 fw-bolder mb-0">{format(data.date).getFullYear()}</div>
                                            </Alert>
                                            <div className="fs-5">{data.barangay}</div>
                                            <div className="fs-6">- {data.venue} -</div>
                                        </div>
                                    </Col>
                                ))
                            }
                        </Row>
                    </Container>
                </section>
                <section className="" id="faqs">
                    <Container className="text-center">
                        <div className="p-5 display-4 fw-bolder">Frequently Asked Questions</div>
                    </Container>
                </section>
                <section className="">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <Container className="py-5 px-5">
                                    <div className="display-6 fw-bold">What are the steps to donate?</div>
                                    <div className="h4">Ano ang mga hakbang para makapag bigay ng dugo?</div>

                                </Container>
                            </Accordion.Header>
                            <Accordion.Body>
                                <Container className="pt-5">
                                    {
                                        Object.entries(steps).map(([key, value]) => (
                                            <Row className="mb-1">
                                                <Col lg={2} className="d-flex flex-column">
                                                    <div className="justify-content-center mb-2 text-center mx-auto">
                                                        <Alert variant="danger" className="rounded-pill d-none d-md-block ratio-1x1 text-center lh-1">
                                                            <div className="display-4 fw-bolder text-dark">{key.toString().padStart(2, '0')}</div>
                                                        </Alert>
                                                    </div>
                                                </Col>
                                                <Col lg={10} className="d-flex align-middle flex-column align-items-center px-2">
                                                    <Container className="">
                                                        <div className="h2 pt-lg-4 fw-medium text-wrap">
                                                            <div className="display-1 fw-bolder d-block d-md-none">{key}.</div>{value}
                                                        </div>
                                                    </Container>
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Container>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </section>
                <section className="">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <Container className="py-5 px-5">
                                    <div className="display-6 fw-bold">Who are the qualified to donate blood?</div>
                                    <div className="h4">Sino-sino ang mga kwalipikado para magbigay ng dugo?</div>
                                </Container>
                            </Accordion.Header>
                            <Accordion.Body>
                                <Container className="pt-5">
                                    {
                                        Object.entries(qualifications).map(([key, value]) => (
                                            <Row className="mb-1">
                                                <Col lg={2} className="d-flex flex-column">
                                                    <div className="justify-content-center mb-2 text-center mx-auto">
                                                        <Alert variant="danger" className="rounded-pill d-none d-md-block ratio-1x1 text-center lh-1">
                                                            <div className="display-4 fw-bolder text-dark">{key.toString().padStart(2, '0')}</div>
                                                        </Alert>
                                                    </div>
                                                </Col>
                                                <Col lg={10} className="d-flex align-middle flex-column align-items-center px-2">
                                                    <Container className="">
                                                        <div className="pt-lg-4 fw-medium text-wrap">
                                                            <div className="d-block h3">
                                                                <div className="fw-bolder d-block d-md-none">{key}.</div>
                                                                <div>{value.en}</div>
                                                            </div>
                                                            <div className="d-block h5">
                                                                <div className="fw-bolder d-block d-md-none">{key}.</div>
                                                                <div>{value.ph}</div>
                                                            </div>
                                                        </div>
                                                    </Container>
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Container>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </section>
                <section className="">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <Container className="py-5 px-5">
                                    <div className="display-6 fw-bold">Prior to Blood Donation, You Must...</div>
                                    <div className="h4">Bago Magbigay ng Dugo, Ikaw ay...</div>
                                </Container>
                            </Accordion.Header>
                            <Accordion.Body>
                                <Container className="pt-5">
                                    {
                                        Object.entries(preparations).map(([key, value]) => (
                                            <Row className="mb-1">
                                                <Col lg={2} className="d-flex flex-column">
                                                    <div className="justify-content-center mb-2 text-center mx-auto">
                                                        <Alert variant="danger" className="rounded-pill d-none d-md-block ratio-1x1 text-center lh-1">
                                                            <div className="display-4 fw-bolder text-dark">{key.toString().padStart(2, '0')}</div>
                                                        </Alert>
                                                    </div>
                                                </Col>
                                                <Col lg={10} className="d-flex align-middle flex-column align-items-center px-2">
                                                    <Container className="">
                                                        <div className="pt-lg-4 fw-medium text-wrap">
                                                            <div className="d-block h3">
                                                                <div className="fw-bolder d-block d-md-none">{key}.</div>
                                                                <div>{value.en}</div>
                                                            </div>
                                                            <div className="d-block h5">
                                                                <div className="fw-bolder d-block d-md-none">{key}.</div>
                                                                <div>{value.ph}</div>
                                                            </div>
                                                        </div>
                                                    </Container>
                                                </Col>
                                            </Row>
                                        ))
                                    }
                                </Container>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </section>
                <section className="bg-danger text-light" id="aboutus">
                    <Container className="py-5">
                        <div className="display-5 fw-bold">About Us</div>
                    </Container>
                </section>
                <section className="">
                    <Container className="py-5">
                        <div className="display-6 fw-bold mb-5">City Health Office</div>

                        <Carousel className="vh-50 shadow shadow-lg rounded-3" fade>
                            {
                                image.cho.map((item, index) => (
                                    <Carousel.Item interval={5000} key={index} className="rounded-3">
                                        <Image src={item} className={`carousel-image rounded-3 ${index % 2 === 0 ? "with-text" : ""}`} />
                                        <Carousel.Caption>
                                            <div className="fs-4 fw-bold">City Health Office</div>
                                            <div className="fs-5">takes a hands-on approach in community health initiatives. Notably, the officer actively coordinates events such as bloodletting campaigns, showcasing a commitment to direct involvement in initiatives that positively impact public health. Through their multifaceted role, the City Health Officer plays a pivotal part in both routine health services and special events, ensuring the well-being of the community.</div>
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                ))
                            }
                        </Carousel>
                    </Container>
                </section>
            </main>
            <Footer />
        </React.Fragment >
    );
}

export default Home;