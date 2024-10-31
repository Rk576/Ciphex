import React from "react";
import Avatar from 'boring-avatars';
import {Button} from "@/components/ui/button";

interface NavParams {
    name: string;
}

export const NavBar: React.FC<NavParams> = (props) => {
    return(
        <div className={"w-[100%] flex p-3 px-9 items-center justify-between"}>
            <div className={"flex text-gray-300 border border-gray-700 rounded-lg gap-5 p-2 px-5 items-center justify-center"}>
                <Avatar size={30} name={props.name} variant="beam"/>
                <p>{props.name}</p>
            </div>
            <Button>Sign Out </Button>
        </div>
    )
}