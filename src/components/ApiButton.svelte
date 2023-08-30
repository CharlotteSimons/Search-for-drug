<script>
  import { Button, Spinner } from 'flowbite-svelte';
  
  export let text = 'Submit';
  export let onClick;
  export let disabled = false;
  export let loading = false;
  export let color = 'blue';
</script>

<Button on:click={onClick} disabled={disabled || loading} {color}>

  {#if loading}
    <Spinner size="4" color="white" /><span class="ml-2">Processing ...</span>
  {:else}
  <span>{text}</span>
    
  {/if}
</Button>