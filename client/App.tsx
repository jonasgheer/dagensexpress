import * as React from "react";
import * as ReactDOM from "react-dom";
import { Home } from "./Home";
import { Login } from "./Login";

// todo: get 401 on api call? get new token -> login

export function App() {
    const jwt = localStorage.getItem("jwt");
    console.log("got render");
    console.log(jwt);

    if (!jwt) {
        return <Login />;
    }

    return <Home />;
}

ReactDOM.render(<App />, document.getElementById("root"));
