import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import navigation from "../config/navigation";
import preferences from "../config/preferences";
import { PublicUrl } from '../config/routes';

const Footer = () => {

    const background = preferences.background.color;
    const variant = preferences.background.variant;
    const gradient = preferences.background.gradient;

    const social = navigation.footer.social;
    const nav = navigation.footer.navigation;

    return (
        <footer id="footer">
            <section className={["mb-0", ("bg-" + background), gradient, (variant === "dark" ? "text-light" : "text-dark")].join(" ")}>
                <Container className="py-3 d-flex justify-content-center justify-content-md-center justify-content-lg-between">
                    <div className="text-start h5 mb-0 d-none d-lg-block">Connect with us on our social media platforms</div>
                    <div className="text-end">
                        {
                            social.map(platform => (
                                <Link {...{
                                    className: ["fs-5", "text-decoration-none", "mx-2", "text-light", platform.icon].join(" "),
                                    key: platform.label,
                                    title: platform.label,
                                    to: platform.url,
                                }} />
                            ))
                        }
                    </div>
                </Container>
            </section>
            <section className="bg-dark text-light py-4 border-bottom border-1 border-secondary">
                <Container>
                    <Row className="lh-sm">
                        <Col sm={12} lg={8} className="text-justify mb-3 d-none d-sm-block">
                            <div className="h3 fw-bold mb-2">{preferences.name.long}</div>
                            <div className="h5">
                                {preferences.name.long} – Empowering Lives, One Donation at a Time. Stay Connected for Upcoming Events, Education, and Collaboration Opportunities. Contact Us for Inquiries and Join Our Mission to Make a Lasting Impact on Community Health– Empowering Lives, One Donation at a Time. Stay Connected for Upcoming Events, Education, and Collaboration Opportunities. Contact Us for Inquiries and Join Our Mission to Make a Lasting Impact on Community Health
                            </div>
                        </Col>
                        {
                            nav.map(data => (
                                <Col key={data.title} sm={4} lg={2}>
                                    <div className="h3 fw-bold mb-2">
                                        {data.title}
                                    </div>
                                    <div className="fs-5">
                                        {
                                            data.links.map(anchor => (
                                                <Link {...{
                                                    key: anchor.label,
                                                    to: anchor.url,
                                                    className: "d-block text-decoration-none text-light mb-2",
                                                    dangerouslySetInnerHTML: { __html: anchor.label },
                                                }} />
                                            ))
                                        }
                                    </div>
                                </Col>
                            ))
                        }
                    </Row>
                </Container>
            </section>
            <section className="d-flex align-item-center bg-dark text-light py-3">
                <Container className="text-center">
                    <Link className="fs-6 text-decoration-none text-warning" to={PublicUrl.home}>
                        © {(new Date()).getFullYear()} Copyright | {preferences.url}
                    </Link>
                </Container>
            </section>
        </footer>
    );
}

export default Footer;