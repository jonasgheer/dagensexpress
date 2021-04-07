import { derived, writable } from "svelte/store";
import axios from "axios";
import type { Token } from "../../common/types";
import jwtDecode from "jwt-decode";

// export const jwt = readable<string | null>(null, (set) => {
//     const jwt = localStorage.getItem("jwt");
//     if (!jwt) {
//     } else {
//         set(jwt);
//     }
// });

const jwt = writable(localStorage.getItem("jwt"));

const ax = derived(jwt, ($jwt) => {
    const ax = axios.create({
        headers: { Authorization: $jwt },
    });
    ax.interceptors.response.use((response) => {
        if (response.status === 401) {
            localStorage.removeItem("jwt");
            jwt.set(null);
        }
        return response;
    });

    return ax;
});

const user = derived(jwt, ($jwt) => {
    if ($jwt === null)
        return {
            userId: undefined,
            isAdmin: undefined,
            username: undefined,
        };
    const decoded = jwtDecode<Token>($jwt.split(" ")[1]);
    return {
        userId: decoded.sub,
        isAdmin: decoded.adm,
        username: decoded.unm,
    };
});

const userColors = writable([]);

export { ax, jwt, user, userColors };
