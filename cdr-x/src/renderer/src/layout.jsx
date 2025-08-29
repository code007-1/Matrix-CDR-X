import { Outlet } from "react-router-dom";
import UpperMenu from "./menu/uppermenu";
import { useDispatch } from "react-redux";
import { set_incoming_cdr, set_internal_cdr, set_outgoing_cdr, set_incoming_loading, set_internal_loading, set_outgoing_loading } from "./modules/contexts/slice";
import { useEffect } from "react";
import { api } from "./modules/api";

export async function fetchData(dispatch) {

    function addsno(data) {
        data.forEach(element, index => {
            element[sno] = index;
        });
        return data;
    }

    let loaded = true;
    await api.get('/load_data', {
        params: { type: "internal" }
    }).then(((result) => {
        dispatch(set_internal_cdr(result.data));
        dispatch(set_internal_loading(false));
    })).catch((error) => {
        console.log("error while loading data : ", error);
        loaded = false;
    });

    await api.get('/load_data', {
        params: { type: "incoming" }
    }).then(((result) => {
        dispatch(set_incoming_cdr(result.data));
        dispatch(set_incoming_loading(false));
    })).catch((error) => {
        console.log("error while loading data : ", error);
        loaded = false;
    });

    await api.get('/load_data', {
        params: { type: "outgoing" }
    }).then(((result) => {
        dispatch(set_outgoing_cdr(result.data));
        dispatch(set_outgoing_loading(false));
    })).catch((error) => {
        console.log("error while loading data : ", error);
        loaded = false;
    });

    return loaded;
}

export function Layout() {
    const dispatch = useDispatch();

    useEffect(() => { fetchData(dispatch); }, [])

    return (
        <>
            <div className="w-full">
                <div className="">
                    <UpperMenu />
                </div>
                <div className="h-full">
                    <Outlet />
                </div>
            </div>
        </>
    );
}