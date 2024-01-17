import preferences from "./preferences";
import { AdminUrl, BloodbankUrl, HospitalUrl, PublicUrl } from "./routes";

const navigation = {
    sidebar: {
        admin: [
            {
                label: "Dashboard",
                icon: "bx bxs-grid-alt",
                url: AdminUrl.Dashboard,
            },
            {
                label: "Event",
                icon: "fa-regular fa-calendar",
                url: AdminUrl.Event,
            },
            {
                label: "Donor",
                icon: "fa-solid fa-hospital-user",
                url: AdminUrl.Donor,
            },
            {
                label: "Hospital",
                icon: "fa-solid fa-hospital",
                url: AdminUrl.Hospital,
            },
            {
                label: "Bloodbank",
                icon: "bx bx-transfer",
                url: AdminUrl.Request,
            },
            {
                label: "Reports",
                icon: "fa-solid fa-chart-pie",
                url: AdminUrl.Reports,
            },
        ],
        bloodbank: [
            {
                label: "Dashboard",
                icon: "bx bxs-grid-alt",
                url: BloodbankUrl.Dashboard,
            },
            // {
            //     label: "Event",
            //     icon: "fa-regular fa-calendar",
            //     url: BloodbankUrl.Event,
            // },
            // {
            //     label: "Donor",
            //     icon: "fa-solid fa-hospital-user",
            //     url: BloodbankUrl.Donor,
            // },
            {
                label: "Request",
                icon: "bx bx-transfer",
                url: BloodbankUrl.Request,
            },
            {
                label: "Reports",
                icon: "fa-solid fa-chart-pie",
                url: BloodbankUrl.Reports,
            },
        ],
        hospital: [
            {
                label: "Dashboard",
                icon: "bx bxs-grid-alt",
                url: HospitalUrl.Dashboard,
            },
            {
                label: "Request",
                icon: "bx bx-transfer",
                url: HospitalUrl.Request,
            },
            {
                label: "Reports",
                icon: "fa-solid fa-chart-pie",
                url: HospitalUrl.Reports,
            },
        ],
    },
    header: {
        admin:
            [
                {
                    label: "Home",
                    url: PublicUrl.Home,
                    className: ""
                },
            ],
        public:
            [
                {
                    label: "Home",
                    url: PublicUrl.Home,
                    className: ""
                },
                {
                    label: "Events",
                    url: PublicUrl.Home.concat("#events"),
                    className: ""
                },
                {
                    label: "Schedule",
                    url: PublicUrl.Home.concat("#schedule"),
                    className: ""
                },
                {
                    label: "FAQs",
                    url: PublicUrl.Home.concat("#faqs"),
                    className: ""
                },
                {
                    label: "About Us",
                    url: PublicUrl.Home.concat("#aboutus"),
                    className: ""
                },
            ],
        // donor:
        //     [
        //         {
        //             label: "Dashboard",
        //             url: route.donor.dashboard,
        //             className: ""
        //         },
        //         {
        //             label: "Blood Event",
        //             url: route.donor.bloodevent,
        //             className: ""
        //         },
        //         // {
        //         //     label: "History",
        //         //     url: route.donor.history,
        //         //     className: ""
        //         // },
        //         {
        //             label: "Information",
        //             url: route.donor.information,
        //             className: ""
        //         },
        //         {
        //             label: "Settings",
        //             url: route.donor.settings,
        //             className: ""
        //         },
        //     ]
    },
    footer: {
        social: [
            {
                label: "Facebook",
                url: "/",
                icon: "bi bi-facebook"
            },
            {
                label: "Google",
                url: "/",
                icon: "bi bi-google"
            },
            {
                label: "Instagram",
                url: "/",
                icon: "bi bi-instagram"
            },
            {
                label: "Tiktok",
                url: "/",
                icon: "bi bi-tiktok"
            },
            {
                label: "Twitter",
                url: "/",
                icon: "bi bi-twitter"
            },
        ],
        navigation: [
            {
                title: "Useful Links",
                links: [
                    {
                        label: "Home",
                        url: PublicUrl.Home,
                    },
                    // {
                    //     label: "Registration",
                    //     url: route.public.register.index,
                    // },
                    // {
                    //     label: "Login",
                    //     url: route.public.login,
                    // },
                    // {
                    //     label: "About Us",
                    //     url: PublicUrl.About,
                    // },
                    // {
                    //     label: "Forgot Password",
                    //     url: route.public.forgot,
                    // },
                ],
            },
            // {
            //     title: "Policies",
            //     links: [
            //         { label: "Terms and Conditions", url: route.public.terms },
            //         { label: "Privacy Policy", url: route.public.privacy },
            //     ],
            // },
            {
                title: "About",
                links: [
                    { label: preferences.address.city, url: "" },
                    { label: preferences.contact.email, url: "" },
                    { label: preferences.contact.mobile, url: "" },
                    { label: preferences.contact.telephone, url: "" },
                ],
            },
        ],
    },
    searchbar: {
        admin: {
            settings: [
                {
                    label: "Personal Settings",
                    description: "Manage your personal information and preferences. Update your profile details, change passwords, and customize your account settings easily.",
                    url: "/",
                },
                {
                    label: "Security Settings",
                    description: "Safeguard your account and data. Set up two-factor authentication, manage password options, and control access for enhanced protection.",
                    url: "/",
                },
                {
                    label: "Notification Settings",
                    description: "Stay in control of your updates. Choose when and how you receive notifications and stay informed on your terms.",
                    url: "/",
                },
            ],
            request: [
                {
                    label: "Blood Donor Requests",
                    description: "Initiate and respond to blood donation requests. Connect donors with recipients in urgent need of blood donations.",
                    url: "/",
                },
                {
                    label: "Blood Supply Requests",
                    description: "Manage and fulfill blood supply requests from hospitals and medical facilities. Ensure a steady supply of blood for patients in need.",
                    url: "/",
                },
                {
                    label: "Emergency Requests",
                    description: "Handle emergency blood requests on a priority basis. Coordinate rapid responses to critical situations and save lives.",
                    url: "/",
                },
            ],
            reports: [
                {
                    label: "Donor Activity Report",
                    description: "View donor engagement and contribution data. Track donor registrations, donations, and participation to improve outreach strategies.",
                    url: "/",
                },
                {
                    label: "Blood Inventory Report",
                    description: "Monitor blood inventory levels and usage patterns. Optimize stock management to ensure a well-maintained and readily available blood supply.",
                    url: "/",
                },
                {
                    label: "Donation Analytics",
                    description: "Analyze donor demographics and trends. Gain insights into donation frequency, blood types, and geographic distribution.",
                    url: "/",
                },
            ],
        },
        hospital: {
            settings: [
                {
                    label: "Personal Settings",
                    description: "Manage your personal information and preferences. Update your profile details, change passwords, and customize your account settings easily.",
                    url: "/",
                },
                {
                    label: "Security Settings",
                    description: "Safeguard your account and data. Set up two-factor authentication, manage password options, and control access for enhanced protection.",
                    url: "/",
                },
                {
                    label: "Notification Settings",
                    description: "Stay in control of your updates. Choose when and how you receive notifications and stay informed on your terms.",
                    url: "/",
                },
            ],
        },
    },
};

export default navigation;