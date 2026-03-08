import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2Icon, SaveIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api } from '@/modules/api';
import { useToast } from "@/hooks/use-toast";

const defaultDevice = {
    name: 'New Device',
    ip: '',
    incomingPort: '',
    outgoingPort: '',
    intercallsPort: '',
};

export default function DeviceSettings() {
    const [devices, setDevices] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/devices');
            if (response.data && Array.isArray(response.data)) {
                setDevices(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch devices:", error);
            toast({
                variant: "destructive",
                title: "Error fetching devices",
                description: "Could not load device settings."
            });
        }
    };

    const handleChange = (index, field, value) => {
        const newDevices = [...devices];
        newDevices[index][field] = value;
        setDevices(newDevices);
    };

    const addDevice = () => {
        setDevices([...devices, { ...defaultDevice }]);
    };

    const removeDevice = (index) => {
        if (confirm("Are you sure you want to remove this device?")) {
            const newDevices = devices.filter((_, i) => i !== index);
            setDevices(newDevices);
        }
    };

    const saveDevices = async () => {
        try {
            // Basic validation
            for (const device of devices) {
                if (!device.name || !device.ip) {
                    toast({
                        variant: "destructive",
                        title: "Validation Error",
                        description: "Name and IP are required for all devices."
                    });
                    return;
                }
            }

            // For simplicity /devices POST can handle list or we iterate.
            await api.post('/devices/bulk', { devices });

            toast({
                title: "Success",
                description: "Device settings saved successfully."
            });
            fetchDevices(); // Refresh
        } catch (error) {
            console.error("Failed to save devices:", error);
            toast({
                variant: "destructive",
                title: "Error saving devices",
                description: "Could not save device settings."
            });
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-end items-center mb-6">
                <Button onClick={saveDevices}>
                    <SaveIcon className="mr-2 h-4 w-4" /> Save All Changes
                </Button>
            </div>

            <Accordion type="multiple" className="w-full space-y-4">
                {devices.map((device, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4 bg-card">
                        <AccordionTrigger className="hover:no-underline">
                            <span className="font-semibold text-lg">{device.name || `Device ${idx + 1}`}</span>
                            <span className="ml-4 text-sm text-muted-foreground font-normal hidden sm:block">{device.ip}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <Input
                                        value={device.name}
                                        onChange={(e) => handleChange(idx, 'name', e.target.value)}
                                        placeholder="Device Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">IP Address</label>
                                    <Input
                                        value={device.ip}
                                        onChange={(e) => handleChange(idx, 'ip', e.target.value)}
                                        placeholder="192.168.1.10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Incoming Port</label>
                                    <Input
                                        type="number"
                                        value={device.incomingPort}
                                        onChange={(e) => handleChange(idx, 'incomingPort', e.target.value)}
                                        placeholder="Port"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Outgoing Port</label>
                                    <Input
                                        type="number"
                                        value={device.outgoingPort}
                                        onChange={(e) => handleChange(idx, 'outgoingPort', e.target.value)}
                                        placeholder="Port"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Intercalls Port</label>
                                    <Input
                                        type="number"
                                        value={device.intercallsPort}
                                        onChange={(e) => handleChange(idx, 'intercallsPort', e.target.value)}
                                        placeholder="Port"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end mt-2">
                                    <Button variant="destructive" size="sm" onClick={() => removeDevice(idx)}>
                                        <Trash2Icon className="mr-2 h-4 w-4" /> Remove Device
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {devices.length === 0 && (
                <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                    No devices configured. Click "Add Device" to start.
                </div>
            )}

            <Button variant="outline" onClick={addDevice} className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" /> Add Device
            </Button>
        </div>
    );
}
