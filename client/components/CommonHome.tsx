import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { io } from "socket.io-client";
import { AdminHome } from "./admin/AdminHome";
import { ax, UserContext } from "./App";
import { UserHome } from "./user/UserHome";
import { UserCard } from "./UserCard";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { Dashboard } from "./admin/Dashboard";
import { Users } from "./admin/Users";
import { CreateNewUserDialog } from "./dialogs/CreateNewUserDialog";
import { Stats } from "./admin/Stats";
import { StatsChooseDate } from "./admin/StatsChooseDate";

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
    const queryClient = useQueryClient();
    const user = React.useContext(UserContext);
    const { data, isLoading } = useQuery<string>("subject", () =>
        ax
            .get<string>("/hub/subject", { headers: { Authorization: jwt } })
            .then((res) => res.data)
    );

    const { data: usersData, isLoading: loadingUsers } = useQuery(
        "userColor",
        () =>
            ax
                .get("/user/color", { headers: { Authorization: jwt } })
                .then((res) => res.data)
    );

    React.useEffect(() => {
        ax.defaults.headers.common["Authorization"] = jwt;

        socket.emit("token", jwt);

        socket.on("message", (m: string) => {
            console.log(m);
        });

        socket.on("invalidate", (key: string) => {
            queryClient.invalidateQueries(key);
        });

        if (!user?.isAdmin) {
            socket.emit("ping", user?.userId, user?.username);
            setInterval(
                () => socket.emit("ping", user?.userId, user?.username),
                5000
            );
        }
    }, []);

    const home = isAdmin ? (
        <AdminHome />
    ) : (
        <main>
            <UserHome />
        </main>
    );

    if (loadingUsers) {
        return <p>"loading..."</p>;
    }

    return (
        <UserColorContext.Provider value={usersData}>
            <HashRouter>
                <header>
                    <h1>
                        {isAdmin ? (
                            <Link to="/">#dagensspørsmål</Link>
                        ) : (
                            "#dagensspørsmål"
                        )}
                    </h1>
                    {isAdmin && (
                        <>
                            <Link to="/questions">Spørsmål</Link>
                            <Link to="/users">Deltagere</Link>
                            <Link to={"/stats/set-date"}>Stats</Link>
                        </>
                    )}
                    {user && <UserCard username={user?.username} />}
                </header>
                <div className="subject">
                    <h1>{isLoading ? "loading..." : data}</h1>
                </div>
                <Routes>
                    <Route path="/" element={home} />
                    <Route path="/questions" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route
                        path="/stats/set-date"
                        element={<StatsChooseDate />}
                    />
                    <Route path="/stats/results" element={<Stats />} />
                    <Route
                        path="/create-user"
                        element={<CreateNewUserDialog />}
                    />
                </Routes>
            </HashRouter>
        </UserColorContext.Provider>
    );
}
