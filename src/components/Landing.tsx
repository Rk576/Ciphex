"use client"

import React from "react"
import {Encryption1} from "@/components/encryption1";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {Decryption1} from "@/components/Decryption1";

export default function Landing() {

    return (
        <div className="flex items-start justify-start min-h-screen p-4 px-9">
            <Tabs defaultValue="Encryption" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Encryption">Encryption</TabsTrigger>
                    <TabsTrigger value="Decryption">Decryption</TabsTrigger>
                </TabsList>
                <TabsContent value="Encryption">
                    <Encryption1/>
                </TabsContent>
                <TabsContent value="Decryption">
                    <Decryption1/>
                </TabsContent>
            </Tabs>
        </div>
    )
}