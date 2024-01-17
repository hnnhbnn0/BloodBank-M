import React from "react";
import { Alert, Badge, Container, Dropdown, Form, Image, InputGroup, Nav, Navbar } from "react-bootstrap";
import Clock from 'react-live-clock';
import { Link, useLocation } from "react-router-dom";

import image from "../config/image";
import navigation from "../config/navigation";
import preferences from "../config/preferences";
import Auth from "../context/auth";

import "../assets/styles/sidebar.css";

const background = preferences.background.color;

const Anchor = ({ label, icon, url = null, onClick, className = { list: "", anchor: "", }, children, title }) => {
    return children ? (
        <li className={className.list} onClick={onClick} title={title}>
            {children}
        </li>
    ) : (
        <li className={className.list} onClick={onClick} title={title}>
            <Link to={url} className={className.anchor}>
                <i className={icon}></i>
                <span className="page">{label}</span>
            </Link>
            <span className="tooltip">{label}</span>
        </li>
    )
};

const Sidebar = {
    Container: ({ children }) => (
        <React.Fragment>
            {children}
        </React.Fragment>
    ),
    Content: ({ children }) => (
        <section className="content">
            {children}
        </section>
    ),
    Layout: ({ children }) => (
        <main className="main-container">
            {children}
        </main>
    ),
    Navigation: () => {

        const location = useLocation();
        const path = location.pathname;
        const target = path.split("/")[1].toString().toLowerCase();
        const audience = navigation.sidebar[target] || [];
        const { logout, theme } = Auth.getContext();

        return (
            <Navbar expand="lg" variant={theme.value} className="bg-transparent d-block d-xl-none">
                <Container className="mx-lg-0">
                    <Image src={image.logo} alt="" height={45} />
                    <Navbar.Brand as={Link} to="#" className="d-block d-xl-none">
                        <span className="fs-4 d-inline ps-lg-3">
                            {
                                audience.map(data => (
                                    (path === data.url) && <span {...{ key: data.label, dangerouslySetInnerHTML: { __html: data.label } }} />
                                ))
                            }
                        </span>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="d-lg-flex justify-content-end">
                        <Nav>
                            {
                                audience.map(data => (
                                    <Nav.Item key={data.label}>
                                        <Nav.Link {...{
                                            as: Link,
                                            to: data.url,
                                            className: ["fs-5", (location.pathname === data.url ? "active" : "")].join(" "),
                                            dangerouslySetInnerHTML: { __html: data.label }
                                        }} />
                                    </Nav.Item>
                                ))
                            }
                            {
                                <Nav.Item>
                                    <Link className="nav-link fs-5" onClick={theme.toggle}>
                                        <span className="d-block d-lg-none fs-5">{theme.label}</span>
                                        <Badge {...{
                                            pill: true,
                                            bg: background,
                                            className: ["d-none", "d-lg-block", "p-2", "bi", theme.icon].join(" "),
                                            dangerouslySetInnerHTML: { __html: theme.label },
                                        }} />
                                    </Link>
                                </Nav.Item>
                            }
                            {
                                <Nav.Item>
                                    <Link className="nav-link fs-5" onClick={logout}>Logout</Link>
                                </Nav.Item>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    },
    Search: ({ className }) => {

        const [searchText, setSearchText] = React.useState("");
        const location = useLocation();
        const path = location.pathname;
        const target = path.split("/")[1].toString().toLowerCase();
        const audience = navigation.searchbar[target] || [];
        const windowSize = React.useRef({ width: window.innerWidth, height: window.innerHeight });

        const handleSearch = (event) => {
            setSearchText(event.target.value);
        };

        const truncateText = (text, maxLength) => {
            if (text.length <= maxLength) return text;
            return text.slice(0, maxLength) + "...";
        };

        const highlightMatch = (text, query) => {
            const regex = new RegExp(`\\b(${query})`, "gi");
            return text.replace(regex, `<span class="text-danger">$1</span>`);
        };

        const filteredCategories = Object.entries(audience).filter(([_category, entries]) => {
            return entries.some((entry) => entry.label.toLowerCase().includes(searchText.toLowerCase()) || entry.description.toLowerCase().includes(searchText.toLowerCase()));
        }).sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB));

        React.useEffect(() => {
            const handleClickOutside = (event) => {
                if (!event.target.closest(".search-box")) {
                    setSearchText("");
                }
            };
            document.addEventListener("click", handleClickOutside);
            return () => {
                document.removeEventListener("click", handleClickOutside);
            };
        }, []);

        return (
            <Container className="alert p-0 mb-0">
                <InputGroup className="search-box border-bottom border-2 border-danger mb-2">
                    <InputGroup.Text className="fs-4 bi bi-search text-danger bg-transparent border-0" />
                    <Form.Control type="search" size="lg" className="search-input no-focus-border bg-transparent border-0" placeholder="Search" value={searchText} onChange={handleSearch} />
                </InputGroup>
                <Alert variant="light" className={`w-100 position-absolute start-0 search-result fs-6 py-2 px-2 rounded-0 shadow p-3 mb-0 ${className} ${searchText ? "d-block" : "d-none"}`}>
                    {
                        filteredCategories.length > 0 ? (
                            filteredCategories.map(([category, entries]) => (
                                <div key={category}>
                                    <Dropdown.Header className="text-capitalize">{category}</Dropdown.Header>
                                    {
                                        entries.filter((entry) => entry.label.toLowerCase().includes(searchText.toLowerCase()) || entry.description.toLowerCase().includes(searchText.toLowerCase()))
                                            .sort((entryA, entryB) => entryA.label.localeCompare(entryB.label))
                                            .map((entry, index) => (
                                                <a key={index} className="alert alert-light btn btn-danger w-100 text-start my-1 py-2 px-1 px-md-2 border-0 text-decoration-none" href={entry.url}>
                                                    <strong className="fs-5" dangerouslySetInnerHTML={{ __html: highlightMatch(truncateText(entry.label, windowSize.current.width / 3), searchText) }} />
                                                    <div className="fs-6" dangerouslySetInnerHTML={{ __html: highlightMatch(truncateText(entry.description, windowSize.current.width / 3), searchText) }} />
                                                </a>
                                            ))}
                                </div>
                            ))
                        ) : (
                            <Alert variant="light border-0 mb-0 fs-5 py-2 px-2">
                                <strong className="fs-5">No results found. 😢</strong>
                                <div className="fs-6">{truncateText(`Oops, it looks like we couldn't find any results matching your search. Please check the spelling and try again.`, windowSize.current.width / 3)}</div>
                            </Alert>
                        )
                    }
                </Alert>
            </Container>
        );
    },
    Toggle: () => {
        const location = useLocation();
        const path = location.pathname;
        const target = path.split("/")[1].toString().toLowerCase();
        const audience = navigation.sidebar[target] || [];
        const { logout, theme, state, user } = Auth.getContext();


        const [tab, setTab] = React.useState(true);
        const interval = 5000;
        React.useEffect(() => {
            const switcher = setInterval(() => {
                setTab(!tab);
            }, interval);
            return () => clearInterval(switcher);
            //eslint-disable-next-line
        }, [tab]);

        return (
            <header className={["sidebar", state.value].join(" ")}>
                <section className="company">
                    <Image src={image.logo} className="logo" alt="..." />
                    <div className="info">
                        <div className="name">{preferences.name.short}</div>
                        <div className="type">{preferences.name.long.split(" ").splice(1, 2).join(" ")}</div>
                    </div>
                    <i className={["btn-sidebar", state.icon].join(" ")} onClick={state.toggle} title={state.info} />
                </section>
                <section className="menu">
                    <ul className="nav-list">
                        {
                            audience.map(data => (
                                <Anchor {...{
                                    key: data.label,
                                    label: data.label,
                                    icon: data.icon,
                                    url: data.url,
                                    className: {
                                        anchor: (data.url === path) ? "active" : "",
                                    }
                                }} />
                            ))
                        }
                        {
                            <Anchor {...{ className: { anchor: "btn-theme", list: "list-theme-bottom" }, label: theme.label, icon: theme.icon, onClick: theme.toggle, title: theme.info }} />
                        }
                        {
                            <Anchor className={{ list: "profile", anchor: "btn-theme" }}>
                                <div className="profile-details">
                                    <Image className="icon" src={image.logo} alt="..." />
                                    <div className={tab ? "d-block" : "d-none"}>
                                        <div className="name fw-bold text-capitalize">{user.name || "Full Name"}</div>
                                        <div className="position text-capitalize">{user.position || "Position"}</div>
                                    </div>
                                    <div className={tab ? "d-none" : "d-block"}>
                                        <div className="name fw-bold">
                                            <Clock format={'hh:mm:ss A'} ticking={true} timezone={'Asia/Manila'} />
                                        </div>
                                        <div className="position">
                                            <Clock format="MMMM M, YYYY" />
                                        </div>
                                    </div>
                                    <i className="bx bx-log-out btn-logout" title="Logout" onClick={logout} />
                                </div>
                            </Anchor>
                        }
                    </ul>
                </section>
            </header>
        );
    }
};

export default Sidebar;