import * as React from "react";
import { useContext } from "react";
import { UserContext } from "./App";

export function UserHome() {
    const user = useContext(UserContext);
    console.log(user);
    return <p>Hello {user?.userId}</p>;
}
