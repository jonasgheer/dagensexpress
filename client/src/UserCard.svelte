<script lang="ts">
    import { userColors } from "./store";

    export let username = "";
</script>

<div class="card">
    <div style="background-color: {$userColors[username] ?? 'transparent'}" />
    <div>{username}</div>
</div>

<style>
    .card {
        display: flex;
        justify-content: space-between;
        border: 2px solid none;
        background-color: var(--white-400);
        border-radius: 5px;
        margin: 0.3rem 1rem;
        text-align: center;
    }

    .card > div:first-of-type {
        width: 0.5rem;
        margin: 0;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .card > div:not(:first-of-type) {
        padding: 0.3rem 0.5rem;
        flex-grow: 1;
        color: black;
    }
</style>
