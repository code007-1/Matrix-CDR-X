import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/modules/api';
import { LockIcon, SaveIcon } from 'lucide-react';

export default function SecuritySettings() {
    const { toast } = useToast();
    const form = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match"
            });
            return;
        }

        try {
            // Backend expects Bearer oldPassword:newPassword
            const encoded = `${data.currentPassword}:${data.newPassword}`;
            const response = await api.post("/update", {}, {
                headers: {
                    'Authorization': `Bearer ${encoded}`
                }
            });

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Password updated successfully."
                });
                form.reset();
            }
        } catch (error) {
            console.error("Password update error:", error);
            const msg = error.response?.data?.message || "Failed to update password.";
            toast({
                variant: "destructive",
                title: "Error",
                description: msg
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your login credentials securely.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            rules={{ required: "Current password is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            rules={{
                                required: "New password is required",
                                minLength: { value: 6, message: "Password must be at least 6 characters" }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            rules={{ required: "Please confirm your new password" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">
                            <SaveIcon className="mr-2 h-4 w-4" /> Update Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
