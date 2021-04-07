<script lang="ts">
    import { useQuery } from "@sveltestack/svelte-query";
    import { ax, userColors, user } from "./store";
    import UserCard from "./UserCard.svelte";
    import AdminHome from "./AdminHome.svelte";
    import UserHome from "./UserHome.svelte";

    const subjectQuery = useQuery<string>("subject", () =>
        $ax.get("/hub/subject").then((res) => res.data)
    );

    $ax.get("/user/color").then((res) => ($userColors = res.data));
</script>

<header>
    <h1>#dagensspørsmål</h1>
    <UserCard username={$user.username} />
</header>
<div class="subject">
    <h1>
        {#if $subjectQuery.isLoading}
            "loading..."
        {:else}
            {$subjectQuery.data}
        {/if}
    </h1>
</div>
{#if $user.isAdmin}
    <AdminHome />
{:else}
    <UserHome />
{/if}

<style>
    .subject {
        display: flex;
        justify-content: center;
    }

    .subject h1 {
        z-index: -1;
        margin: 0;
        border-radius: 0 0 10px 10px;
        padding: 0.5em 1em;
        background-color: var(--white-400);
        width: fit-content;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }
</style>
