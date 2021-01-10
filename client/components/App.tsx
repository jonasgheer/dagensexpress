import { Button, ChakraProvider, Flex } from "@chakra-ui/react";
import jwtDecode from "jwt-decode";
import * as React from "react";
import { useState } from "react";
import * as ReactDOM from "react-dom";
import { Token } from "../../common/types";
import { AdminHome } from "./admin/AdminHome";
import { Login } from "./Login";
import { UserHome } from "./user/UserHome";
import { UserCard } from "./UserCard";

// todo: get 401 on api call? get new token -> login

const socket = new WebSocket("ws://localhost:8080");

export const UserContext = React.createContext<{
    userId: number;
    isAdmin: boolean;
    username: string;
    color: string;
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
        return (
            <ChakraProvider>
                <Flex
                    bg="gray.100"
                    h="100vh"
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    pb="10"
                >
                    <Login />
                </Flex>
            </ChakraProvider>
        );
    }

    const decoded = jwtDecode<Token>(jwt.split(" ")[1]);

    const home = decoded.adm ? (
        <AdminHome refresh={lastServerUpdate} jwt={jwt} />
    ) : (
        <UserHome jwt={jwt} refresh={lastServerUpdate} />
    );

    return (
        <ChakraProvider>
            <UserContext.Provider
                value={{
                    userId: decoded.sub,
                    isAdmin: decoded.adm,
                    username: decoded.unm,
                    color: decoded.col,
                }}
            >
                <Flex bg="gray.100" h="100vh" direction="column">
                    <Flex p="3" fontSize="1.5rem" bg="gray.100">
                        <UserCard username={decoded.unm} />
                        {decoded.adm && (
                            <Button onClick={() => null}>
                                Legg til spørsmål
                            </Button>
                        )}
                    </Flex>
                    <Flex
                        justifyContent="center"
                        h="100%"
                        alignItems="center"
                        pb="10"
                    >
                        {home}
                    </Flex>
                </Flex>
            </UserContext.Provider>
        </ChakraProvider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
