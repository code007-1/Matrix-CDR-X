import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LockKeyhole, Activity, ShieldCheck, BarChart3, Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../modules/api";
import { useDispatch } from "react-redux";
import { set_access_key, set_login_status } from "../modules/contexts/slice";
import { useToast } from "@/hooks/use-toast";

export function Login() {

    const { toast } = useToast();
    const form = useForm();
    const dispatch = useDispatch();
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
                }
                console.log("data : ", result);

            }).catch((error) => {
                toast({
                    title: "Error",
                    description: error.response.data.message || "Some Error has occured while logging in"
                });
                console.log("login Error", error);
            })
    }

    useEffect(() => {
        if (logged_in === 'true') { navigate("/internal"); }
        else { navigate("/login"); }
    }, [logged_in]);

    return (
        <div className="min-h-screen grid items-center justify-center bg-background md:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r md:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="flex flex-col">
                        <h1 className="hidden font-bold sm:inline-block text-8xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "'Righteous', cursive" }}>
                            CDR-X
                        </h1>
                        <p className="text-2xl mt-4 font-light text-zinc-400">
                            Call Detail Record Analyzer
                        </p>
                    </div>
                </div>

                <div className="relative z-20 flex-1 flex flex-col justify-center space-y-8 px-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Activity className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Real-time Monitoring</h3>
                            <p className="text-zinc-400">Track internal, incoming, and outgoing calls instantly.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Deep Analytics</h3>
                            <p className="text-zinc-400">Visualize call patterns, duration, and extensions.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Search className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Advanced Search</h3>
                            <p className="text-zinc-400">Granular filtering across millions of records.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                            <p className="text-zinc-400">Enterprise-grade data security and management.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Advanced Call Detail Record Analysis and Reporting System for Matrix PBX.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Card className="border-0 shadow-none md:border md:shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Login</CardTitle>
                            <CardDescription className="text-center">
                                Enter your credentials to access the dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="username">Username</Label>
                                                <div className="relative">
                                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-9" placeholder="admin" {...field} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="password">Password</Label>
                                                <div className="relative">
                                                    <LockKeyhole className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input type="password" className="pl-9" placeholder="••••••" {...field} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full">Login</Button>
                                </form>
                            </Form>
                            <div className="mt-4 text-center text-xs text-muted-foreground">
                                Credentials are case sensitive
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}