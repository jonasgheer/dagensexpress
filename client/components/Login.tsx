import * as React from "react";
import { useState } from "react";
import useFetch from "use-http";
import { App } from "./App";
import ErrorOutlineRoundedIcon from "@material-ui/icons/ErrorOutlineRounded";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [jwt, setJwt] = useState();
    const { post, response, loading, error } = useFetch("/login");

    async function submitLogin() {
        const res = await post({ username, password });
        if (response.ok) {
            setJwt(res.token);
            localStorage.setItem("jwt", res.token);
        }
    }

    function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            submitLogin();
        }
    }

    if (loading) {
        return <p>Logging in...</p>;
    }

    if (response.ok) {
        return <App token={jwt} />;
    }

    return (
        <>
            <header>
                <h1>#dagensspørsmål</h1>
            </header>
            <main>
                <div>
                    {error && (
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
