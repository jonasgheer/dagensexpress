import * as React from "react";
import { useContext } from "react";
import useFetch, { CachePolicies } from "use-http";
import { UserContext } from "../App";
import { QuizState } from "../../../src/routes/hub";

export function UserHome({ refresh }: { refresh: number }) {
    const user = useContext(UserContext);
    const { get, response, error, loading, data } = useFetch<QuizState>(
        "/hub",
        {
            headers: { Authorization: localStorage.getItem("jwt") ?? "" },
            cachePolicy: CachePolicies.NO_CACHE,
        },
        [refresh]
    );

    if (loading) {
        return <p>Loading...</p>;
    }

    console.log(data);
    console.log(error);
    return <p>{data?.type}</p>;
}
