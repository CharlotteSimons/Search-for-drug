<script>
    import { Badge } from "flowbite-svelte";
    export let criterion;
</script>
<li>
    {#if criterion.answer === null}
        <div class="p-2">
        <span>{criterion.criteria}</span>
        </div>
    {:else}
        {#if criterion.answer === true}
            <div class="bg-green-100 px-2 py-1 rounded-md mb-2 hover:cursor-pointer">
            <span class="font-semibold">{criterion.criteria}</span>
            <div class="p-1 px-2 bg-white rounded-md mt-2 mb-1 text-gray-600">
                <span class="text-md"><strong>AI:</strong>{criterion.explanation}</span>
            </div>
        </div>
        {:else if criterion.answer === false}
            <div class="bg-red-100 px-2 py-1 rounded-md mb-2 hover:cursor-pointer">
            <span class="font-semibold">{criterion.criteria}</span>
            <div class="p-1 px-2 bg-white rounded-md mt-2 mb-1 text-gray-600">
                <span class="text-md"><strong>AI:</strong>{criterion.explanation}</span>
            </div>
        </div>
        {:else}
            <div class="bg-gray-100 px-2 py-1 rounded-md mb-2 hover:cursor-pointer">
            <span class="font-semibold">{criterion.criteria}</span>
            <div class="p-1 px-2 bg-white rounded-md mt-2 mb-1 text-gray-600">
                <span class="text-md"><strong>AI:</strong>{criterion.explanation}</span>
            </div>
        </div>
        {/if}
    {/if}
</li>