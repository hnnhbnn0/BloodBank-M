import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Admin, Bloodbank, Hospital, Public } from "./config/pages";
import { AdminUrl, BloodbankUrl, HospitalUrl, PublicUrl } from "./config/routes";
import { Loader } from "rsuite";
import Auth from "./context/auth";

const App = () => (

    <React.Suspense fallback={<Loader center vertical size="lg" speed="normal" content="Initializing..." />}>
        <Router>
            <Auth.Provider>
                <Routes>
                    <Route exact path={AdminUrl.Index} element={<Navigate to={AdminUrl.Dashboard} />} />
                    <Route exact path={AdminUrl.Dashboard} element={<Admin.Dashboard />} />
                    <Route exact path={AdminUrl.Event} element={<Admin.Event />} />
                    <Route exact path={AdminUrl.Donor} element={<Admin.Donor />} />
                    <Route exact path={AdminUrl.Request} element={<Admin.Request />} />
                    <Route exact path={AdminUrl.Hospital} element={<Admin.Hospital />} />
                    <Route exact path={AdminUrl.Reports} element={<Admin.Reports />} />
                    <Route exact path={AdminUrl.Login} element={<Admin.Login />} />

                    <Route exact path={HospitalUrl.Index} element={<Navigate to={HospitalUrl.Dashboard} />} />
                    <Route exact path={HospitalUrl.Dashboard} element={<Hospital.Dashboard />} />
                    <Route exact path={HospitalUrl.Request} element={<Hospital.Request />} />
                    <Route exact path={HospitalUrl.Reports} element={<Hospital.Reports />} />

                    <Route exact path={BloodbankUrl.Index} element={<Navigate to={BloodbankUrl.Dashboard} />} />
                    <Route exact path={BloodbankUrl.Dashboard} element={<Bloodbank.Dashboard />} />
                    <Route exact path={BloodbankUrl.Request} element={<Bloodbank.Request />} />
                    <Route exact path={BloodbankUrl.Reports} element={<Bloodbank.Reports />} />

                    <Route index element={<Navigate to={PublicUrl.Home} />} />
                    <Route exact path={PublicUrl.Home} element={<Public.Home />} />
                </Routes>
            </Auth.Provider>
        </Router>
    </React.Suspense >


);

export default App;