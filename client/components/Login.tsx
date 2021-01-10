import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
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
        <FormControl id="login" maxW="300px">
            <FormLabel>Brukernavn</FormLabel>
            <Input
                mb="5"
                type="text"
                bg="white"
                onChange={(e) => setUsername(e.target.value)}
            />
            <FormLabel>Passord</FormLabel>
            <Input
                mb="5"
                type="password"
                bg="white"
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button w="100%" bg="white" type="button" onClick={submitLogin}>
                Logg inn
            </Button>
        </FormControl>
    );
}
