<script>
import { debounce } from 'lodash';
import { Input, Helper } from 'flowbite-svelte';

export let selectedValue = ''
let suggestions = []
let showSuggestions = true

export let valid = true

$: fetchSuggestions(selectedValue)

const handleInput = (event) => {
  selectedValue = event.target.value;
    showSuggestions = true;
};

const handleSelect = (suggestion) => {
  selectedValue = suggestion;
  suggestions = [];
  showSuggestions = false;
  valid = true
};

const fetchSuggestions = debounce(async (query) => {
    if (query && query.length < 2) {
    suggestions = []
    return
  }
  const queryStr = `query {autoComplete(substring: "${query}") {alias}}`

  const response = await fetch('https://enterprise-search.mytomorrows.com/gql/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: queryStr })
  });

  const result = await response.json();
  suggestions = result.data.autoComplete.map(item => item.alias);
}, 300)

</script>

<div class="relative">
  <Input
    type="text"
    class="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
    placeholder="Search"
    value={selectedValue}
    on:input={handleInput}
    on:blur={() => valid = selectedValue.length > 0}
    >
    <svg slot="left" aria-hidden="true" class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    </Input>
    {#if !valid}
      <Helper type="error" class="mt-2" color="red"><span class="font-medium">*Please select a valid value from the dropdown.</span></Helper>
    {/if}

  {#if showSuggestions && suggestions.length > 0}
    <ul class="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1">
      {#each suggestions as suggestion}
        <li 
          class="px-4 py-2 cursor-pointer hover:bg-gray-100"
          on:click={() => handleSelect(suggestion)}
        >{suggestion}</li>
      {/each}
    </ul>
  {/if}
</div>
