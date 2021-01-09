import jwtDecode from "jwt-decode";
import * as React from "react";
import { useState } from "react";
import * as ReactDOM from "react-dom";
import { Token } from "../../common/types";
import { AdminHome } from "./admin/AdminHome";
import { Login } from "./Login";
import { UserHome } from "./user/UserHome";

// todo: get 401 on api call? get new token -> login

const socket = new WebSocket("ws://localhost:8080");

export const UserContext = React.createContext<{
    userId: number;
    isAdmin: boolean;
    username: string;
} | null>(null);

export function App({ token }: { token?: string }) {
    const [lastServerUpdate, setLastServerUpdate] = useState(0);
    const jwt = token ?? localStorage.getItem("jwt");

    console.log("lastserverupdate", lastServerUpdate);

    React.useEffect(() => {
        function update(msg: MessageEvent) {
            setLastServerUpdate(msg.data);
        }
        socket.addEventListener("message", update);
        return () => {
            socket.removeEventListener("message", update);
        };
    });

    if (!jwt) {
        return <Login />;
    }

    const decoded = jwtDecode<Token>(jwt.split(" ")[1]);

    const home = decoded.adm ? (
        <AdminHome />
    ) : (
        <UserHome refresh={lastServerUpdate} />
    );

    return (
        <UserContext.Provider
            value={{
                userId: decoded.sub,
                isAdmin: decoded.adm,
                username: decoded.unm,
            }}
        >
            {home}
        </UserContext.Provider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
