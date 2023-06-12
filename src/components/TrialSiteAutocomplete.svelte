<script>
import { Input, Helper } from 'flowbite-svelte';
import { onMount } from 'svelte';

export let selectedValue = ''
let suggestions = []
let showSuggestions = false;
export let utn;
export let valid = true;
let filteredSuggestions = [];

const handleInput = (event) => {
    // Filter suggestions by substring from input
    filteredSuggestions = suggestions.filter((suggestion) => suggestion.toLowerCase().includes(event.target.value.toLowerCase()));
  selectedValue = event.target.value;
    showSuggestions = true;
};

const handleSelect = (suggestion) => {
  selectedValue = suggestion;
  suggestions = [];
  showSuggestions = false;
  valid = true
};

async function fetchData() {
    try {
      let queryStr = `query {
      studies(where: {id: "${utn}"}) {
          locatedAt {
            uuid
            sitename
            countryname
            city
          }
        }
      }`
      const response = await fetch('https://enterprise-search-develop.mytomorrows.com/gql/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: queryStr })
      });

      const result = await response.json();
      if (result.errors) {
        error = result.errors[0].message;
      } else {
          suggestions = result.data.studies[0].locatedAt.map((item) => item.sitename);
          filteredSuggestions = suggestions;
      }
    } catch (err) {
      error = err.message;
    }
  }
   
    // Load the data from the API
    onMount(() => {
      fetchData();
    });


</script>

<div class="relative">
  <Input
    type="text"
    class="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
    placeholder="Search"
    value={selectedValue}
    on:input={handleInput}
    on:blur={() => valid = selectedValue.length > 0}
    on:click={() => showSuggestions = true}
    >
    <svg slot="left" aria-hidden="true" class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    </Input>
    {#if !valid}
      <Helper type="error" class="mt-2" color="red"><span class="font-medium">*Please select a valid value from the dropdown.</span></Helper>
    {/if}

  {#if showSuggestions && suggestions.length > 0}
    <ul class="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1">
      {#each filteredSuggestions as suggestion}
        <li 
          class="px-4 py-2 cursor-pointer hover:bg-gray-100"
          on:click={() => handleSelect(suggestion)}
        >{suggestion}</li>
      {/each}
    </ul>
  {/if}
</div>
