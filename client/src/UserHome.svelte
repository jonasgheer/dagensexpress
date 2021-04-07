<script lang="ts">
    import {
        useQuery,
        useQueryClient,
        useMutation,
    } from "@sveltestack/svelte-query";
    import { ax } from "./store";
    import type { QuizState } from "../../common/types";
    import type { Answer } from "../../src/entity/Question";

    const queryClient = useQueryClient();

    const quizState = useQuery<QuizState>("quizState", () =>
        $ax.get("/hub").then((res) => res.data)
    );

    const mutation = useMutation(
        (alternative: number) => $ax.get(`/hub/guess/${alternative}`),
        {
            onMutate: async (alternative: Answer) => {
                await queryClient.cancelQueries("quizState");
                const prevState = queryClient.getQueryData<QuizState>(
                    "quizState"
                );
                queryClient.setQueryData("quizState", {
                    ...prevState,
                    haveGuessed: alternative,
                });
            },
            onSettled: () => queryClient.invalidateQueries("quizState"),
        }
    );

    async function submitGuess(alternative: number) {
        $mutation.mutate(alternative as Answer);
    }
</script>

{#if $quizState.isLoading}
    <div>loading...</div>
{:else if $quizState.data?.type === "nothingHere"}
    <div>
        <h1>*trommevirvel*</h1>
    </div>
{:else}
    <p>hello</p>
{/if}
