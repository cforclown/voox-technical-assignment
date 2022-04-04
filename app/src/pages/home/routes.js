import React from "react";

const Dashboard = React.lazy(() => import("./views/dashboard"));
const Issues = React.lazy(() => import("./views/issues"));
const CreateEditIssue = React.lazy(() => import("./views/issues/create-edit-issue"));
const Profile = React.lazy(() => import("./views/profile"));
const Settings = React.lazy(() => import("./views/settings"));
const ContentNotFound = React.lazy(() => import("./views/content-not-found"));

const routes = [
    { path: "/", exact: true, name: "Dashboard" },
    { path: "/dashboard", exact: false, name: "Dashboard", component: Dashboard },
    { path: "/issues", exact: true, name: "Issues", component: Issues },
    { path: "/issues/create-edit-issue", exact: true, name: "Create Edit Issue", component: CreateEditIssue },
    { path: "/settings", exact: false, name: "Settings", component: Settings },
    { path: "/profile", exact: false, name: "Profile", component: Profile },

    { path: "*", name: "404 Page Not Found", component: ContentNotFound },
];

export default routes;
