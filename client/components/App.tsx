import jwtDecode from "jwt-decode";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Token } from "../../common/types";
import { AdminHome } from "./AdminHome";
import { Login } from "./Login";
import { UserHome } from "./UserHome";

// todo: get 401 on api call? get new token -> login

export const UserContext = React.createContext<{
    userId: number;
    isAdmin: boolean;
    username: string;
} | null>(null);

export function App({ token }: { token?: string }) {
    const jwt = token ?? localStorage.getItem("jwt");

    if (!jwt) {
        return <Login />;
    }

    const decoded = jwtDecode<Token>(jwt.split(" ")[1]);

    const home = decoded.adm ? <AdminHome /> : <UserHome />;

    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("open", () => {
        socket.send("Hello server");
    });

    socket.addEventListener("message", (m) =>
        console.log("we got a message!", m)
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
