<script lang="ts">
    import {
        QueryClient,
        QueryClientProvider,
    } from "@sveltestack/svelte-query";
    import { jwt } from "./store";
    import Login from "./Login.svelte";

    const queryClient = new QueryClient();

    $: showLogin = $jwt === null;
</script>

{#if showLogin}
    <Login />
{:else}
    <QueryClientProvider client={queryClient}>
        <div>hello</div>
    </QueryClientProvider>
{/if}
