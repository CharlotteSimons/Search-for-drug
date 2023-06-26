<script>
  import { Button, Modal, Label, Input, Checkbox } from 'flowbite-svelte'
  import ApiButton from './ApiButton.svelte';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';
  

    export let ReportModalOpen = false;
    export let utn = null;


    let email = null;
    let error;

    let reportComplete = false;

    let loading = false;
    function reportFunction() {
        loading = true;
        fetch(PUBLIC_SEARCH_API_BASE + '/v01/community/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: email,
                field: "overall_status",
                new_value: "closed",
                trial_id: utn               
                })
        })
        .then(response => response.json())
        .then(data => {
            loading = false;
            reportComplete = true;
            // Wait 1 sec, then close modal
            setTimeout(() => {
                ReportModalOpen = false;
            }, 2000);
        })
        .catch((error) => {
            alert("Error: " + error);
            loading= false;
        });
    }
</script>

<Modal bind:open={ReportModalOpen} size="xs" autoclose={false} class="w-full">
  <form class="flex flex-col space-y-6" action="#">
    <h3 class="text-xl font-medium text-gray-900 dark:text-white">Report as closed</h3>
    <p>Enter your email address to report {utn} as closed.</p>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" name="email" placeholder="name@company.com" bind:value={email} required />
    </Label>
    <ApiButton onClick={() => reportFunction()} text={"Report as closed"} loading={loading} disabled={reportComplete || !email} class="w-full1" />
  </form>
  {#if reportComplete}
    <p class="text-blue-500 text-sm">Reported as closed</p>
    {/if}
</Modal>