import { useState } from "react";

export function useSignup() {
    const [loading, setLoading] = useState(false);

    const signup = async (name: string, username: string, password: string) => {
        setLoading(true);
        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, username, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            setLoading(false);
            return { success: false, message: "Something went wrong. Please try again." };
        }
    };

    return { signup, loading };
}
