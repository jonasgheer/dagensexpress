<script lang="ts">
    import {
        QueryClient,
        QueryClientProvider,
    } from "@sveltestack/svelte-query";
    import { jwt } from "./store";
    import Login from "./auth/Login.svelte";
    import CommonHome from "./CommonHome.svelte";

    const queryClient = new QueryClient();

    $: showLogin = $jwt === null;
</script>

{#if showLogin}
    <Login />
{:else}
    <QueryClientProvider client={queryClient}>
        <CommonHome />
    </QueryClientProvider>
{/if}
