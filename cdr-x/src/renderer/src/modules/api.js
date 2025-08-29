import { server_address } from "../statics";
import axios from "axios";


export const api = axios.create({
    baseURL: server_address,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 25000
});

api.defaults.withCredentials = true;
api.defaults.withXSRFToken = true;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log("got error");
        const status = error.response ? error.response.status : null;
        if (status === 403) {
            // Refresh the token here (e.g., using your existing logic)
            const newtoken = await instance.get('/refresh', { withCredentials: true });
            dispatch(setAccessKey(newtoken.data.token));
            sessionStorage.setItem('login_status', true);
            dispatch(setLoginStatus(true));
            // Update the request config with the new token
            //console.log("new token data", newtoken.data.token);
            error.config.headers.Authorization = `Bearer ${newtoken.data.token}`;
            // Retry the original request
            console.log("sending request now with cookies");
            return instance.request(error.config);
        }

        else if (status === 401) {
            sessionStorage.setItem('login_status', false);
            return Promise.reject(error);
        }

        //sessionStorage.setItem('login_status', false);
        return Promise.reject(error);
    }
)