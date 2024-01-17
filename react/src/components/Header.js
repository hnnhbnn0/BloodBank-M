import React from 'react';
import { Container, Image, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from "react-router-dom";

import image from '../config/image';
import navigation from '../config/navigation';
import preferences from '../config/preferences';
import { PublicUrl } from '../config/routes';

const Header = () => {

    const location = useLocation();
    const path = location.pathname;
    const audience = location.pathname.split("/")[1].toString().toLowerCase();
    const background = preferences.background.color;
    const variant = preferences.background.variant;
    const gradient = preferences.background.gradient;
    const nav = navigation.header[audience] || [];

    return (
        <Navbar bg={background} variant={variant} expand="lg" className={[gradient].join()}>
            <Container className="d-flex justify-content-around py-2">
                <Link to={PublicUrl.Home}>
                    <Image src={image.logo} height={50} alt="..." />
                </Link>
                <Navbar.Brand className="mx-auto" as={Link} to={PublicUrl.Home}>
                    <span className="fs-4 d-none d-sm-inline ms-lg-2">{preferences.name.long}</span>
                    <span className="fs-4 d-sm-none d-inline">{preferences.name.short}</span>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="d-flex-sm justify-content-end align-items-center">
                    <Nav className="ms-auto">
                        {
                            nav.map(data => (
                                <Nav.Link {...{
                                    key: data.label,
                                    as: "a",
                                    href: data.url,
                                    className: ["fs-5", (data.className ? data.className : ""), (path.match(new RegExp(String(data.url).replace(/\//g, '\\/'))) ? "active" : "")].join(" "),
                                    dangerouslySetInnerHTML: { __html: data.label },
                                }} />
                            ))
                        }

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;


