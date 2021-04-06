import { writable } from "svelte/store";
import axios from "axios";

// export const jwt = readable<string | null>(null, (set) => {
//     const jwt = localStorage.getItem("jwt");
//     if (!jwt) {
//     } else {
//         set(jwt);
//     }
// });

const jwt = writable(localStorage.getItem("jwt"));

const ax = (() => {
    const ax = axios.create({
        headers: { Authorization: jwt },
    });
    ax.interceptors.response.use((response) => {
        if (response.status === 401) {
            localStorage.removeItem("jwt");
            jwt.set(null);
        }
        return response;
    });

    const { subscribe, set } = writable(ax);
    return {
        subscribe,
        renewInstance: () =>
            set(
                axios.create({
                    headers: { Authorization: jwt },
                })
            ),
    };
})();

export { ax, jwt };
