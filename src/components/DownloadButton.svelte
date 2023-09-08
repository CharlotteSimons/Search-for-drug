<script>
  import { Button, Modal } from 'flowbite-svelte';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';
  import { PUBLIC_MICROSERVICE_API_BASE} from '$env/static/public';
  
  let defaultModal = false;

  export let patient_id = null
  
  export let eligible = []
  export let ineligible = []

  export let country = null
  export let disease = null
  export let medical_summary = null

  // current data
  let upload_date = new Date();
  
  // User details
  let approver = null
  let email = null

  let show_success = false;
  async function get_user_details() {
    return new Promise((resolve, reject) => {
      fetch(PUBLIC_MICROSERVICE_API_BASE + "/v1.2.0/api/get_user", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            token: localStorage['hcp.user.session.token']
        })
      })
      // Check if status_code > 300
      .then(response => {
        if (response.status > 300) {
          // Load the response body as JSON, throw body.message as error
          return response.json().then(body => {
            return Promise.reject(new Error(body.message));
          });
        } else {
          return response;
        }
      })  
      .then(response => response.json())
      .then(data => {
        email = data.details.Email1;
        approver = data.details.FirstName + " " + data.details.LastName;
        resolve();  // Resolve the promise
      })
      .catch(error => {
        alert(error);
        reject();  // Reject the promise
      });
    });
  }

  let loading = false;
  async function downloadOptions() {
    loading = true;

    await get_user_details().then(() => {
        
      let payload = {
        "trial_ids": eligible,
        "email": email,
        "tsr_details": {
            "approver": approver,
            "location": country,
            "radius": country,
            "patient_id": patient_id,
            "upload_date": upload_date.toISOString().split('T')[0],
            "disease": disease,
            "ineligible": ineligible,
            "medical_summary": medical_summary
        }
      }

      fetch(PUBLIC_SEARCH_API_BASE + '/v01/search/request_tsr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (response.status > 300) {
          // Load the response body as JSON, throw body.message as error
          return response.json().then(body => {
            return Promise.reject(new Error(body.error));
          });
        } else {
          return response;
        }
      })
      .then(response => response.json())
      .then(data => {
        show_success = true;
        setTimeout(() => {
          defaultModal = false;
          loading = false;
        }, 5000);
      })
      .catch(err => {
        alert(err.message)
        loading = false;
      });
    });
  }

</script>

<Button on:click={() => (defaultModal = true)} color="alternative">Download results</Button>

<Modal title="Download results" bind:open={defaultModal}>
  <div>
    <h3 class="mt-2 mb-7 text-md font-normal text-gray-500 dark:text-gray-400">We will email you a secure link to download a PDF including an overview of the results. It might <span class="font-bold">take up to 2 minutes</span> to arrive, depending on the amount of results.</h3>
    <Button color="green" class="mr-2" on:click={() => downloadOptions()} disabled={loading}>Request email with download link</Button>
    <Button color="alternative" on:click={() => {defaultModal = false;}} disabled={loading}>No, cancel</Button>
    {#if show_success}
      <div class="mt-4">
        <p class="text-blue-500 text-sm">Request successful; You will receive a download link shortly.</p>
      </div>
    {/if}
  </div>
</Modal>