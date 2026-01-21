import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceSettings from './DeviceSettings';
import SecuritySettings from './SecuritySettings';

export default function Settings() {
    return (
        <div className="container mx-auto py-6 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Tabs defaultValue="devices" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="devices">Device Configuration</TabsTrigger>
                    <TabsTrigger value="security">Security & Password</TabsTrigger>
                </TabsList>

                <TabsContent value="devices" className="space-y-4">
                    <DeviceSettings />
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <div className="max-w-2xl">
                        <SecuritySettings />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
