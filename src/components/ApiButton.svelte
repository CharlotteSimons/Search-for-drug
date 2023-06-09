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
    <Spinner class="mr-3" size="4" color="white" />Loading ...
  {:else}
    {text}
  {/if}
</Button>