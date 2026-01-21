import App from "../App";
import Settings from "../pages/Settings";
import { createHashRouter } from "react-router-dom";
import { CDR_Internal } from "../pages/cdr_internal";
import { CDR_Incoming } from "../pages/cdr_incoming";
import { CDR_Outgoing } from "../pages/cdr_outgoing";
import { Login } from "../pages/login";

////////////////////////////////////////////////////////////////////////
// Browser Router
export const router = createHashRouter([
    {
        errorElement: <div>Error 404 Not Found Page</div>,
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/internal",
                element: <CDR_Internal />,
            },
            {
                path: "/incoming",
                element: <CDR_Incoming />,
            },
            {
                path: "/outgoing",
                element: <CDR_Outgoing />,
            },
            {
                path: "/settings",
                element: <Settings />,
            }
        ],
    }
]);