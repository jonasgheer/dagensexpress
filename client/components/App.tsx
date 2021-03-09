import axios, { AxiosInstance } from "axios";
import jwtDecode from "jwt-decode";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
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

export let ax: AxiosInstance;

export function App({ token }: { token?: string }) {
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const [tokenExpired, setTokenExpired] = React.useState(false);
    const jwt = token ?? localStorage.getItem("jwt");

    if (!jwt || tokenExpired) {
        return <Login onSuccess={() => setTokenExpired(false)} />;
    }

    if (!ax) {
        ax = axios.create({
            headers: { Authorization: jwt },
        });
        ax.interceptors.response.use((response) => {
            if (response.status === 401) {
                localStorage.removeItem("jwt");
                setTokenExpired(true);
            }
            return response;
        });
    }

    const decoded = jwtDecode<Token>(jwt.split(" ")[1]);

    if (modalIsOpen) {
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
        </UserContext.Provider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
