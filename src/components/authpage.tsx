"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";
import { useSignup } from "@/hooks/useSignup";
import { useLogin } from "@/hooks/useLogin";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function AuthPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [signupData, setSignupData] = useState({ name: "", username: "", password: "" });
    const [loginData, setLoginData] = useState({ username: "", password: "" });

    const { signup, loading: signupLoading } = useSignup();
    const { login, loading: loginLoading } = useLogin();

    const handleSignup = async () => {
        const { name, username, password } = signupData;
        if (name && username && password) {
            const result = await signup(name, username, password);
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
            } else {
                toast({
                    title: "Unauthorized",
                    description: result.message,
                });
            }
        } else {
            toast({
                title: "Invalid Fields",
                description: "All fields are required",
            });
        }
    };

    const handleLogin = async () => {
        const { username, password } = loginData;
        if (username && password) {
            const result = await login(username, password);
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                    duration: 3
                });

                router.push("/");

            } else {
                toast({
                    title: "Error",
                    description: result.message,
                });
            }
        } else {
            toast({
                title: "Invalid Fields",
                description: "All fields are required",
            });
        }
    };

    return (
        <div className={"w-[100%] min-h-[100vh] flex items-center justify-center md:px-0 px-3"}>
            <Tabs defaultValue="login" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">SignUp</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardDescription>Welcome Back!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="login-username">Username</Label>
                                <Input
                                    id="login-username"
                                    placeholder="username..."
                                    value={loginData.username}
                                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="password..."
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleLogin} disabled={loginLoading}>
                                {loginLoading ? "Logging in..." : "Login"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardDescription>Welcome!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="signup-name">Name</Label>
                                <Input
                                    id="signup-name"
                                    type="text"
                                    placeholder="name..."
                                    value={signupData.name}
                                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="signup-username">Username</Label>
                                <Input
                                    id="signup-username"
                                    type="text"
                                    placeholder="username..."
                                    value={signupData.username}
                                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="password..."
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSignup} disabled={signupLoading}>
                                {signupLoading ? "Signing Up..." : "SignUp"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
