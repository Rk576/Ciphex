"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export function Decryption1() {
    const [sensitiveFileName, setSensitiveFileName] = useState<string | null>(null);
    const [key, setKey] = useState("");
    const [decodedText, setDecodedText] = useState<string | null>(null);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setFileName: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = event.target.files?.[0];
        setFileName(file ? file.name : null);
    };

    const handleDecrypt = async () => {
        const fileInput = document.getElementById("sensitive") as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file || !key) {
            alert("Please provide both the key and the encrypted file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("password", key);

        try {
            const response = await fetch("http://localhost:8000/img_text/decode/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to decrypt the file.");
            }

            const data = await response.json();
            setDecodedText(data.decoded_text); // Display the decrypted text
            alert("File decrypted successfully!");
        } catch (error) {
            console.error(error);
            alert("An error occurred during decryption.");
        }
    };

    return (
        <Card className="w-full max-w-md border-gray-700">
            <CardHeader className={"border-b border-gray-700"}>
                <CardTitle className={"font-medium text-gray-500"}>Decryption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 py-5">
                <div className="space-y-2">
                    <Label htmlFor="key" className="text-sm font-medium text-gray-300">
                        Key
                    </Label>
                    <Input
                        id="key"
                        type="text"
                        placeholder="Enter your key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full border-gray-700 rounded-lg bg-transparent border p-3 text-white placeholder-gray-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sensitive" className="text-sm font-medium text-gray-300">
                        Encrypted File
                    </Label>
                    <div className="flex items-center gap-2">
                        <input
                            id="sensitive"
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, setSensitiveFileName)}
                            accept="image/*"
                        />
                        <Button
                            variant="outline"
                            className="w-full justify-start items-center text-gray-500 hover:bg-gray-700 py-6 border-gray-700"
                            onClick={() => document.getElementById('sensitive')?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4"/>
                            {sensitiveFileName || "Choose File"}
                        </Button>
                    </div>
                </div>

                <Button onClick={handleDecrypt}>Decrypt</Button>

                {decodedText && (
                    <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800 text-white">
                        <Label className="font-semibold text-gray-300">Decrypted Text:</Label>
                        <p className="mt-2 text-gray-100 whitespace-pre-wrap">{decodedText}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
