import React from "react";

const Admin = {
    Dashboard: React.lazy(() => import("../pages/admin/dashboard")),
    Event: React.lazy(() => import("../pages/admin/event")),
    Donor: React.lazy(() => import("../pages/admin/donor")),
    Hospital: React.lazy(() => import("../pages/admin/hospital")),
    Request: React.lazy(() => import("../pages/admin/request")),
    Reports: React.lazy(() => import("../pages/admin/reports")),
    Login: React.lazy(() => import("../pages/admin/login")),
};

const Bloodbank = {
    Dashboard: React.lazy(() => import("../pages/bloodbank/dashboard")),
    Reports: React.lazy(() => import("../pages/bloodbank/reports")),
    Request: React.lazy(() => import("../pages/bloodbank/request")),
};

const Hospital = {
    Dashboard: React.lazy(() => import("../pages/hospital/dashboard")),
    Request: React.lazy(() => import("../pages/hospital/request")),
    Reports: React.lazy(() => import("../pages/hospital/reports")),
};

const Public = {
    Home: React.lazy(() => import("../pages/public/home")),

};

export { Admin, Bloodbank, Hospital, Public };
