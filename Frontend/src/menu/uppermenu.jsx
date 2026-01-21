import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { AdvanceSearch } from "./advance_search";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { set_access_key, set_login_status } from "../modules/contexts/slice";
import { api } from "../modules/api";
import { useTheme } from "@/components/theme-provider";
import { LogOut, Moon, RefreshCw, Settings, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react";

export default function UpperMenu() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const logged_in = sessionStorage.getItem('logged_in');
    const { setTheme, theme } = useTheme();
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        api.get("/devices").then(res => setDevices(res.data)).catch(err => console.error("Failed to fetch devices", err));
    }, []);

    async function logout() {
        await api.post("/logout").then((result) => {
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
        <header className="mx-5 sticky top-0 z-50">
            <div className="flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link to="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block text-2xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "'Righteous', cursive" }}>CDR-X</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link to="/internal" className="transition-colors hover:text-foreground/80 text-foreground/60">All Internal</Link>
                        <Link to="/incoming" className="transition-colors hover:text-foreground/80 text-foreground/60">All Incoming</Link>
                        <Link to="/outgoing" className="transition-colors hover:text-foreground/80 text-foreground/60">All Outgoing</Link>

                        <div className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="outline-none">By Device</DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Select By Device</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {devices.length === 0 && <DropdownMenuItem disabled>No devices found</DropdownMenuItem>}
                                    {devices.map(device => (
                                        <DropdownMenuSub key={device.id}>
                                            <DropdownMenuSubTrigger>
                                                <span>{device.name}</span>
                                                <span className="ml-2 text-xs text-muted-foreground">({device.ip})</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem asChild><Link to={`/internal?ip=${device.ip}`} className="w-full cursor-pointer">Internal Calls</Link></DropdownMenuItem>
                                                    <DropdownMenuItem asChild><Link to={`/incoming?ip=${device.ip}`} className="w-full cursor-pointer">Incoming Calls</Link></DropdownMenuItem>
                                                    <DropdownMenuItem asChild><Link to={`/outgoing?ip=${device.ip}`} className="w-full cursor-pointer">Outgoing Calls</Link></DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer" tabIndex={0}>
                            <AdvanceSearch />
                        </div>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <Button variant="ghost" size="icon" title="Settings"><Link to="/settings" tabIndex={-1}><Settings className="h-[1.2rem] w-[1.2rem] transition-all" /></Link></Button>
                    <Button variant="ghost" size="icon" title="Refresh Data" onClick={() => window.location.reload()}><RefreshCw className="h-[1.2rem] w-[1.2rem] transition-all" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Toggle Theme"><Sun className="h-[1.2rem] w-[1.2rem] transition-all dark:-rotate-90 dark:scale-0" /><Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /></Button>
                    <Button variant="ghost" size="icon" onClick={logout} title="Logout"><LogOut className="h-[1.2rem] w-[1.2rem] transition-all" /></Button>
                </div>
            </div>
        </header>
    );
}