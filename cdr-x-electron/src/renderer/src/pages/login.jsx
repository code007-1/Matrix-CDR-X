import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { Link, Navigate, redirect, useNavigate } from "react-router-dom";
import { api } from "../modules/api";
import { useDispatch, useSelector } from "react-redux";
import { set_access_key, set_login_status } from "../modules/contexts/slice";
import { useToast } from "@/hooks/use-toast";

export function Login() {

    const { toast } = useToast();
    const form = useForm();
    const dispatch = useDispatch();
    //const logged_in = useSelector((state) => state.app_slice.logged_in);
    const navigate = useNavigate();
    const logged_in = sessionStorage.getItem('logged_in');

    async function onSubmit(e) {
        const encoded = (`${e.username}:${e.password}`);

        await api.post("/login", {},
            { headers: { 'Authorization': `Bearer ${encoded}` } }).then((result) => {
                if (result.status == 200) {
                    dispatch(set_login_status(true));
                    sessionStorage.setItem('logged_in', 'true');
                    dispatch(set_access_key(result.data.token));
                    toast({
                        title: "Logged in Successfully"
                    });
                    //navigate("/home/devices");
                    //return (<Private_Route element={<Devices />} />);
                }
                console.log("data : ", result);

            }).catch((error) => {
                toast({
                    title: "Error",
                    description: "Some Error has occured while logging in"
                });
                console.log("login Error", error);
            })
    }

    useEffect(() => {
        if (logged_in === 'true') { navigate("/internal"); }
        else { navigate("/login"); }
    }, [logged_in]);

    return (
        <>
            <div className="h-screen flex flex-col justify-center items-center">
                <div className="z-10 w-96 cursor-pointer shadow-md bg-background shadow-border rounded-md p-6 m-6">
                    <div className="text-xl font-bold"><center>CDR-X</center></div>
                    <div className="mb-4 text-sm font-bold"><center>Matrix CDR Reports</center></div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="username">User Name</Label>
                                        <div className="flex items-center">
                                            <User className="mr-2" />
                                            <FormControl>
                                                <Input className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage className="" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="password" className="text-left">Password</Label>
                                        <div className="flex items-center">
                                            <LockKeyhole className="mr-2" />
                                            <FormControl>
                                                <Input type="password" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage className="" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className="text-sm"><center>Note: User Name and Password are case sensitive</center></div>
                            <div className="flex justify-end">
                                <Button type="submit">Login</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
}