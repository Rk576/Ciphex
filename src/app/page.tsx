"use client";

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/usecurruser';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Landing from '@/components/Landing'
import {Loader2} from "lucide-react";
import {NavBar} from "@/components/navbar";

export default function Home() {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { fetchCurrentUser } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {

        const getUser = async () => {
            try {
                const result = await fetchCurrentUser();
                if (result.success) {
                    setCurrentUser(result.message);
                    toast({
                        title: "Success",
                        description: `Welcome, ${result.message}!`,
                        duration: 3
                    });
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: `Failed to fetch user data ${error}`,
                });
                setCurrentUser(null);
                router.push('/auth');
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, []);

    if (loading) {
        return <div className={"w-[100%] h-[100vh] flex items-center justify-center"}>
            <Loader2 size={40} className={"animate-spin text-gray-400"} />
        </div>;
    }

    return (
        <div>
            {currentUser ? (
                <div className={"flex flex-col h-[100vh] w-[100%] font-[family-name:var(--font-geist-mono)]"}>
                    <NavBar name={currentUser} />
                    <Landing />
                </div>
            ) : null}
        </div>
    );
}
