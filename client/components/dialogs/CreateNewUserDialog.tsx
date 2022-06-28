import { Dialog } from "../Dialog";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { ax } from "../App";

export function CreateNewUserDialog() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [color, setColor] = React.useState("");

    const { mutate: createUser } = useMutation(
        () => ax.post("/admin/user", { username, password, color }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("/users");
                navigate("/users");
            },
        }
    );

    return (
        <Dialog
            isOpen={true}
            onClose={() => navigate("/users")}
            className="add-user"
        >
            <label>
                Brukernavn
                <input
                    type={"text"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </label>
            <label>
                Passord
                <input
                    type={"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            <label>
                Farge
                <input
                    type={"color"}
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </label>
            <button
                className={"btn"}
                disabled={username === "" || password === ""}
                onClick={() => {
                    createUser();
                }}
            >
                Lagre
            </button>
        </Dialog>
    );
}
