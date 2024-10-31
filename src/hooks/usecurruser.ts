import { useState } from "react";

export function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/curruser", {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                setCurrentUser(data.user);
                return { success: true, message: data.user.username };
            } else {
                return { success: false, message: "Please login to proceed" };
            }
        } catch (error) {
            setLoading(false);
            return { success: false, message: "Something went wrong. Please try again." };
        }
    };

    return { currentUser, loading, fetchCurrentUser };
}
