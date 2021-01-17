import jwtDecode from "jwt-decode";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CachePolicies, Provider } from "use-http";
import { Token } from "../../common/types";
import { CommonHome } from "./CommonHome";
import { Login } from "./Login";

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

    return (
        <UserContext.Provider
            value={{
                userId: decoded.sub,
                isAdmin: decoded.adm,
                username: decoded.unm,
            }}
        >
            <Provider
                options={{
                    headers: { Authorization: jwt },
                    cachePolicy: CachePolicies.NO_CACHE,
                }}
            >
                <CommonHome jwt={jwt} isAdmin={decoded.adm} />
            </Provider>
        </UserContext.Provider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
