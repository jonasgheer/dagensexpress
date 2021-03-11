import * as React from "react";
import { useState } from "react";
import { App } from "./App";
import ErrorOutlineRoundedIcon from "@material-ui/icons/ErrorOutlineRounded";
import axios from "axios";

export function Login({ onSuccess }: { onSuccess: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [jwt, setJwt] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    async function submitLogin() {
        setIsLoading(true);
        axios
            .post<{ token: string }>("/login", {
                username,
                password,
            })
            .then((res) => {
                setJwt(res.data.token);
                localStorage.setItem("jwt", res.data.token);
                onSuccess();
                setIsSuccess(true);
            })
            .catch(() => setIsError(true))
            .finally(() => setIsLoading(false));
    }

    function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            submitLogin();
        }
    }

    if (isLoading) {
        return <p>Logging in...</p>;
    }

    if (isSuccess) {
        return <App token={jwt} />;
    }

    return (
        <>
            <header>
                <h1>#dagensspørsmål</h1>
            </header>
            <main>
                <div>
                    {isError && (
                        <div id="login-error">
                            <ErrorOutlineRoundedIcon />
                            Feil brukernavn eller passord
                        </div>
                    )}
                    <form id="login">
                        <label>
                            Brukernavn
                            <input
                                onKeyUp={handleKey}
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                        <label>
                            Passord
                            <input
                                onKeyUp={handleKey}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                        <button type="button" onClick={submitLogin}>
                            Logg inn
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
