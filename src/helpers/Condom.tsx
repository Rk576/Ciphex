"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/usecurruser";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export const Condom: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { fetchCurrentUser, loading } = useCurrentUser();
    const [isUserChecked, setIsUserChecked] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const result = await fetchCurrentUser();

            if (!result.success) {
                router.push("/auth");
            } else {
                if (pathname === "/auth") {
                    router.push("/");
                }
            }

            setIsUserChecked(true);
        };

        if (!isUserChecked) {
            checkUser();
        }
    }, [router, pathname, fetchCurrentUser, isUserChecked]);

    if (loading || !isUserChecked) {
        return (
            <div className={"w-[100%] h-[100vh] flex items-center justify-center"}>
                <Loader2 size={40} className={"animate-spin text-gray-400"} />
            </div>
        );
    }

    return <>{children}</>;
};
