import jwtDecode from "jwt-decode";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { CachePolicies, IncomingOptions, Provider } from "use-http";
import { Token } from "../../common/types";
import { CommonHome } from "./CommonHome";
import { Login } from "./Login";

export const UserContext = React.createContext<{
    userId: number;
    isAdmin: boolean;
    username: string;
} | null>(null);

export const ModalContext = React.createContext<{
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const queryClient = new QueryClient();

export function App({ token }: { token?: string }) {
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const [tokenExpired, setTokenExpired] = React.useState(false);
    const jwt = token ?? localStorage.getItem("jwt");

    if (!jwt || tokenExpired) {
        return <Login onSuccess={() => setTokenExpired(false)} />;
    }

    const decoded = jwtDecode<Token>(jwt.split(" ")[1]);

    const useHttpOptions: IncomingOptions = {
        headers: { Authorization: jwt },
        cachePolicy: CachePolicies.NO_CACHE,
        interceptors: {
            response: async ({ response }) => {
                if (response.status === 401) {
                    localStorage.removeItem("jwt");
                    setTokenExpired(true);
                }
                return response;
            },
        },
    };

    if (modalIsOpen) {
        console.log("open");
        document.body.style.overflow = "hidden";
    } else if (!modalIsOpen) {
        console.log("close");
        document.body.style.overflow = "visible";
    }

    return (
        <UserContext.Provider
            value={{
                userId: decoded.sub,
                isAdmin: decoded.adm,
                username: decoded.unm,
            }}
        >
            <Provider options={useHttpOptions}>
                <QueryClientProvider client={queryClient}>
                    <ModalContext.Provider
                        value={{
                            isOpen: modalIsOpen,
                            setIsOpen: setModalIsOpen,
                        }}
                    >
                        <CommonHome jwt={jwt} isAdmin={decoded.adm} />
                    </ModalContext.Provider>
                </QueryClientProvider>
            </Provider>
        </UserContext.Provider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
