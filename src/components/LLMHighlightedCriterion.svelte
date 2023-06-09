<script>
    import { Badge } from "flowbite-svelte";
    export let criterion;

    let collapsed = true;
</script>
<li>
    {#if criterion.answer === null}
        <div class="p-2">
        <span>{criterion.criteria}</span>
        </div>
    {:else}
        <div class="bg-white p-2 rounded-md mb-1 hover:cursor-pointer" on:click={() => collapsed = !collapsed}>
            <span><strong>{criterion.criteria}</strong></span>
            <!-- Position criterion at bottom right of div -->
            {#if criterion.answer === true}
                <span class="ml-1 p-1 text-sm text-white bg-green-500 rounded-sm" >Yes</span><br>
            {:else if criterion.answer === false}
                <span class="ml-1 p-1 text-sm text-white bg-red-500 rounded-sm">No</span><br>
            {:else}
                <span class="ml-1 p-1 text-sm text-white bg-gray-400 rounded-sm">Unknown</span><br>
            {/if}
            <!-- Collapsable -->
            {#if !collapsed}
            <div class="p-1 bg-slate-50 rounded-md">
                <span class="italic text-sm"><strong>✨ Reasoning by AI:</strong>{criterion.explanation}</span>
            </div>
            {/if}
        </div>
    {/if}
</li>