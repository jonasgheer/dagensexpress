import * as React from "react";
import { useState } from "react";
import useFetch from "use-http";
import { App } from "./App";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [jwt, setJwt] = useState();
    const { post, response, loading, error } = useFetch("/login");

    async function submitLogin() {
        const res = await post({ username, password });
        setJwt(res.token);
        localStorage.setItem("jwt", res.token);
    }

    if (loading) {
        return <p>Logging in...</p>;
    }

    if (error) {
        return <p>Something went wrong</p>;
    }

    if (response.ok) {
        return <App token={jwt} />;
    }

    return (
        <form>
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div>
                <button type="button" onClick={submitLogin}>
                    Submit
                </button>
            </div>
        </form>
    );
}
