import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import cookie from "../helpers/cookie";
import textcase from "../helpers/textcase";

const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {

    const navigate = useNavigate();
    const domain = "https://blood-donation-api-iota.vercel.app/";
    // const domain = "http://localhost:8080/";

    const location = window.location;
    const pathname = location.pathname;
    const audience = pathname.split("/")[1].toString().toLowerCase();
    const protectedUsers = ["admin", "hospital", "bloodbank"];
    const initial = {
        theme: localStorage.getItem("theme") || "light",
        state: localStorage.getItem("sidebar") || "open",
    }
    // eslint-disable-next-line
    const [theme, setTheme] = React.useState(initial.theme);
    // eslint-disable-next-line
    const [state, setState] = React.useState(initial.state);

    // eslint-disable-next-line
    React.useEffect(() => {
        if (theme !== initial.theme) {
            setTheme(initial.theme);
        }
        if (state !== initial.state) {
            setState(initial.state);
        }
        // eslint-disable-next-line
    }, []);

    console.log(domain);

    React.useEffect(() => {

        if (sessionStorage.position && cookie.get("session") && pathname === "/public/login") {
            Swal.fire({
                title: "Session Detected",
                html: "You are now signing in.",
                icon: "success",
                timer: 2000,
                timerProgressBar: true,
                allowOutsideClick: false,
                showCloseButton: false,
                showConfirmButton: false,
                showCancelButton: false,
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    navigate("/" + sessionStorage.position);
                }
            });
        }

        if (protectedUsers.includes(audience)) {

            if (cookie.get("session") && audience !== sessionStorage.position) {
                Swal.fire({
                    title: "Unauthorized Access",
                    html: "You are not allowed to access another resource.",
                    icon: "warning",
                    timer: 1000,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    showCloseButton: false,
                    showConfirmButton: false,
                    showCancelButton: false,
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        navigate("/" + sessionStorage.position);
                    }
                });
            }
            if (!cookie.get("session")) {
                sessionStorage.removeItem("position");
                Swal.fire({
                    title: "Session Expired",
                    html: "You are now loggin out.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    showCloseButton: false,
                    showConfirmButton: false,
                    showCancelButton: false,
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        window.location.href = "/public/login";
                    }
                });
            }
        }
        // eslint-disable-next-line
    }, [navigate, pathname]);

    React.useEffect(() => {
        const section = document.getElementById(location.hash.substring(1));
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);


    const sidebar = {
        state: {
            icon: state === "open" ? "bx bxs-left-arrow" : "bx bxs-right-arrow",
            info: ["Toggle sidebar", (state === "open" ? "close" : "open")].join(" "),
            label: ["Sidebar", textcase("sentence", state)].join(" "),
            toggle: () => setState(state === "open" ? "close" : "open"),
            value: state,
        },
        theme: {
            icon: theme === "dark" ? "bi-sun-fill" : "bi-moon-fill",
            info: ["Toggle theme to", (theme === "dark" ? "light" : "dark"), "mode"].join(" "),
            label: [textcase("sentence", (theme === "dark" ? "light" : "dark")), "Mode"].join(" "),
            toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
            value: theme,
        },
    };

    const [user, setUser] = React.useState({});

    const get_data = async () => {
        try {
            const response = await axios.get(domain.concat("api/v/user"), {
                params: {
                    key: cookie.get("session"),
                }
            });
            setUser(response.data);
            console.log(response.data);
            sessionStorage.setItem("position", response.data.position);
        } catch (error) {
            // setUser({});
        }
    }

    React.useEffect(() => {

        get_data();

    }, []);
    // { user.image, user.name }


    // eslint-disable-next-line
    React.useEffect(() => {
        localStorage.setItem("sidebar", state);
        localStorage.setItem("theme", theme);

        const body = document.body;

        if (protectedUsers.includes(audience)) {
            body.className = `${theme} rs-theme-${theme}`;
            body.setAttribute("data-bs-theme", theme);
        }
        // eslint-disable-next-line
    }, [theme, state]);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        cookie.remove("session");
        sessionStorage.removeItem("position");

        Swal.fire({
            title: "Logged out",
            html: "You are now loggin out.",
            icon: "info",
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: false,
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                window.location.href = "/public/login";
            }
        });
    }

    return (
        <AuthContext.Provider value={{ user, state: sidebar.state, domain, theme: sidebar.theme, login, logout }}>
            {children}
        </AuthContext.Provider >
    );
};

const useAuth = () => (
    React.useContext(AuthContext)
);

const Auth = {
    Provider: AuthProvider,
    getContext: useAuth,
}

export default Auth;

