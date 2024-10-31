"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload } from "lucide-react"

export function Encryption1() {
    const [coverFileName, setCoverFileName] = useState<string | null>(null)
    const [key, setKey] = useState("")
    const [text, setText] = useState("")
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setFileName: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile) // Store the file for upload
            setFileName(selectedFile.name)
        }
    }

    const handleEncrypt = async () => {
        if (!file || !text) {
            alert("Please select a file and enter the sensitive text.")
            return
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("message", text)
        formData.append("password", key)

        try {
            const response = await fetch("http://localhost:8000/img_text/encode/", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            // Create a blob from the response
            const blob = await response.blob()
            // Create a link element to download the encrypted image
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${file.name.split('.')[0]}-enc.png` // Set the file name for download
            document.body.appendChild(a)
            a.click() // Trigger the download
            a.remove() // Cleanup
        } catch (error) {
            console.error("Error during encryption:", error)
            alert("Failed to encrypt the image. Please try again.")
        }
    }

    return (
        <Card className="w-full max-w-md border-gray-700">
            <CardHeader className={"border-b border-gray-700"}>
                <CardTitle className={"font-medium text-gray-500"}>Encryption</CardTitle>
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
                    <Label htmlFor="text" className="text-sm font-medium text-gray-300">
                        Sensitive Text
                    </Label>
                    <Input
                        id="text"
                        type="text"
                        placeholder="Enter your text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full border-gray-700 rounded-lg bg-transparent border p-3 text-white placeholder-gray-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cover" className="text-sm font-medium text-gray-300">
                        Cover File
                    </Label>
                    <div className="flex items-center gap-2">
                        <input
                            id="cover"
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, setCoverFileName)}
                            accept="image/*"
                        />
                        <Button
                            variant="outline"
                            className="w-full justify-start items-center text-gray-500 hover:bg-gray-700 py-6 border-gray-700"
                            onClick={() => document.getElementById('cover')?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {coverFileName || "Choose File"}
                        </Button>
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <Button className={""} onClick={handleEncrypt}>Encrypt</Button>
                    <Button className={"gap-3"} variant={"outline"} disabled={true}>
                        Download <Download size={15} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
