import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { AdvanceSearch } from "./advance_search";
import final from "../assets/final.png"
import { fetchData } from "../layout";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { set_access_key, set_login_status } from "../modules/contexts/slice";
import { api } from "../modules/api";

export default function UpperMenu() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const logged_in = sessionStorage.getItem('logged_in');

    async function logout() {
        await api.post("/logout",
        ).then((result) => {
            if (result.status == 200) {
                dispatch(set_access_key(null));
                dispatch(set_login_status(false));
                Cookies.remove('token');
                sessionStorage.setItem('logged_in', 'false');
                localStorage.clear('currentPage');
                toast({
                    variant: "default",
                    title: "Logged Out Succesfully"
                });
            }
        }).catch((error) => {
            toast({
                variant: "default",
                title: "Some Error has occured while logging out",
                description: error
            });
            console.log("logging out error : ", error);
        })
    }

    useEffect(() => {
        if (logged_in === 'false') { navigate("/login"); }
    }, [logged_in]);

    return (
        <>
            <div className="h-12 shadow-md flex justify-end items-center align-middle space-x-0 overflow-x-auto">
                <div className="ml-2 mr-auto">
                    <img src={final} className="h-10 w-auto" />
                </div>
                <div>
                    <Button onClick={(e) => {
                        if (fetchData(dispatch))
                            toast({
                                variant: "default",
                                title: "Data Refreshed Succesfully"
                            });
                    }}>Refresh</Button>
                </div>
                <div>
                    <AdvanceSearch />
                </div>
                <div>

                </div>
                <div>
                    <Link to="/internal">
                        <Button variant="ghost">Internal CDR</Button>
                    </Link>
                    <Link to="/incoming">
                        <Button variant="ghost">Incoming CDR</Button>
                    </Link>
                    <Link to="/outgoing">
                        <Button variant="ghost">Outgoing CDR</Button>
                    </Link>
                </div>
                <div>
                </div>
                <div>
                    <Button variant="ghost" onClick={logout}>Logout</Button>
                </div>
            </div >
        </>
    );
}