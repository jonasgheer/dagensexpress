import * as React from "react";
import { io } from "socket.io-client";
import useFetch from "use-http";
import { AdminHome } from "./admin/AdminHome";
import { UserContext } from "./App";
import { UserHome } from "./user/UserHome";
import { UserCard } from "./UserCard";

const socket = io();

export const UserColorContext = React.createContext<
    { [key: string]: string }[]
>([]);

export function CommonHome({
    jwt,
    isAdmin,
}: {
    jwt: string;
    isAdmin: boolean;
}) {
    const user = React.useContext(UserContext);
    const [lastServerUpdate, setLastServerUpdate] = React.useState(0);
    const { data, loading } = useFetch<string>("/hub/subject", [
        lastServerUpdate,
    ]);
    const { data: usersData, loading: loadingUsers } = useFetch(
        "/user/color",
        []
    );

    React.useEffect(() => {
        socket.emit("token", jwt);

        socket.on("message", (m: string) => {
            console.log(m);
        });

        socket.on("adminEvent", (time: number) => {
            setLastServerUpdate(time);
        });

        socket.on("refresh", (time: number) => {
            setLastServerUpdate(time);
        });
    }, []);

    const home = isAdmin ? (
        <AdminHome refresh={lastServerUpdate} jwt={jwt} />
    ) : (
        <main>
            <UserHome refresh={lastServerUpdate} />
        </main>
    );

    if (loadingUsers) {
        return <p>"loading..."</p>;
    }

    return (
        <UserColorContext.Provider value={usersData}>
            <header>
                <h1>#dagensspørsmål</h1>
                {user && <UserCard username={user?.username} />}
            </header>
            <div className="subject">
                <h1>{loading ? "loading..." : data}</h1>
            </div>
            {home}
        </UserColorContext.Provider>
    );
}
