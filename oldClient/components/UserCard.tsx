import * as React from "react";
import { UserColorContext } from "./CommonHome";

export function UserCard({ username = "user" }: { username?: string }) {
    const users = React.useContext(UserColorContext);
    return (
        <div className="user-card">
            <div style={{ backgroundColor: users[username] }} />
            <div>{username}</div>
        </div>
    );
}
