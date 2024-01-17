const Admin = {
    Index: "/admin",
    Login: "/public/login",
    Dashboard: "/admin/dashboard",
    Donor: "/admin/donor",
    Event: "/admin/event",
    History: "/admin/history",
    Hospital: "/admin/hospital",
    Reports: "/admin/reports",
    Request: "/admin/request",
    Settings: "/admin/settings",
};

const Bloodbank = {
    Index: "/bloodbank",
    Dashboard: "/bloodbank/dashboard",
    Donor: "/bloodbank/donor",
    Event: "/bloodbank/event",
    Reports: "/bloodbank/reports",
    Request: "/bloodbank/request",
};

const Public = {
    Index: "/",
    About: "/public/about",
    Home: "/public/home",
    Forgot: "/public/home",
};

const Hospital = {
    Index: "/hospital",
    Event: "/hospital/event",
    Dashboard: "/hospital/dashboard",
    History: "/hospital/history",
    Reports: "/hospital/reports",
    Request: "/hospital/request",
    Settings: "/hospital/settings",
};

export {
    Admin as AdminUrl,
    Bloodbank as BloodbankUrl,
    Hospital as HospitalUrl,
    Public as PublicUrl,
};