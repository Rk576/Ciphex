import { useState } from "react";

export function useLogin() {
    const [loading, setLoading] = useState(false);

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            return { success: response.ok, message: data.message || "Login failed" };
        } catch (error) {
            return { success: false, message: "Something went wrong!" };
        } finally {
            setLoading(false);
        }
    };

    return { login, loading };
}
