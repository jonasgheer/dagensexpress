import { useQuery, useQueryClient } from "react-query";
import { ax } from "../App";
import { User } from "../../../src/entity/User";
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserCard } from "../UserCard";

export function Users() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const query = useQuery(
        "users",
        () => ax.get<User[]>("/admin/users").then((r) => r.data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("userColor");
            },
        }
    );

    if (!query.data) {
        return <div>loading...</div>;
    }

    return (
        <div className="users">
            <div>
                <button
                    className="btn"
                    onClick={() => navigate("/create-user")}
                >
                    Legg til deltager
                </button>
            </div>
            <div>
                {query.data.map((u) => (
                    <UserCard key={u.id} username={u.username} />
                ))}
            </div>
            <div />
        </div>
    );
}
