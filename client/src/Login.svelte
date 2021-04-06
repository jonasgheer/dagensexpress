<script lang="ts">
    import AlertCircleOutline from "svelte-material-icons/AlertCircleOutline.svelte";
    import axios from "axios";
    import { jwt } from "./store";

    let username = "";
    let password = "";

    let isLoading = false;
    let isSuccess = false;
    let isError = false;

    async function submitLogin() {
        isLoading = true;
        axios
            .post<{ token: string }>("/login", {
                username,
                password,
            })
            .then((res) => {
                localStorage.setItem("jwt", res.data.token);
                jwt.set(res.data.token);
                isSuccess = true;
            })
            .catch(() => (isError = true))
            .finally(() => (isLoading = false));
    }

    function handleKey(e: KeyboardEvent) {
        if (e.key === "Enter") {
            submitLogin();
        }
    }
</script>

<header>
    <h1>#dagensspørsmål</h1>
</header>
<main>
    {#if isLoading}
        <p>loading...</p>
    {:else}
        <div>
            {#if isError}
                <div id="login-error">
                    <AlertCircleOutline />
                    <span>Feil brukernavn eller passord</span>
                </div>
            {/if}
            <form>
                <label>
                    Brukernavn
                    <input on:keyup={handleKey} bind:value={username} />
                </label>
                <label>
                    Passord
                    <input
                        on:keyup={handleKey}
                        type="password"
                        bind:value={password}
                    />
                </label>
                <button type="button" on:click={submitLogin}> Logg inn </button>
            </form>
        </div>
    {/if}
</main>

<style>
    form {
        background-color: var(--brown-400);
        padding: 0.5em;
        border-radius: 10px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        max-width: 900px;
        display: flex;
        flex-direction: column;
    }

    button {
        margin-top: 0.5em;
    }

    input {
        margin-top: 0.2em;
    }

    #login-error {
        display: flex;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 0.8rem;
        border-radius: 10px;
        background-color: var(--red-200);
        padding: 1em;
        border: 2px solid var(--red-400);
        margin: 1em;
    }

    #login-error > span {
        margin-left: 0.3em;
    }
</style>
