<script>
    import { Toast, Drawer, CloseButton, Input, Label, Textarea, Alert } from 'flowbite-svelte';
    import { sineIn } from 'svelte/easing';
    import SearchAutocomplete from './SearchAutocomplete.svelte';
    import ApiButton from './ApiButton.svelte';
    import TrialSiteAutocomplete from './TrialSiteAutocomplete.svelte';
    import { PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';
    
    export let hidden1 = true;
    export let utn = null;
    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    let show = false;
    let counter = 5;
    let toast_color = 'red';
    let toast_message = 'Something went wrong. Please contact beta@mytomorrows.com.';
    
    function trigger() {
        show = true;
        counter = 5;
        timeout();
    }
    function timeout() {
        if (--counter > 0)
        return setTimeout(timeout, 1000);
        show = false;
    }

    let selectedCondition = null;
    let selectedSite = null;
    let requestText = null;
    let email = null;

    let requesting = false;
    async function requestAccess() {
        requesting = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/create_request', { 
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Email1": email,
                "FurtherHelp": requestText,
                "RequestType": "General Query",
                "TreatmentIndication": selectedCondition,
                "Trial": utn,
                "TrialSite": selectedSite,
                "token": sessionStorage['hcp.user.session.token']
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
            requesting = false;
            if (data.status === 'Succes') {
                toast_color = 'green';
                toast_message = 'Your request has been succesfully sent.';
                trigger();
            } else {
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        })
        .catch((error) => {
            requesting = false;
            toast_color = 'red';
            toast_message = 'Something went wrong. Please contact beta@mytomorrows.com.';
            trigger();
        });
    }

</script>

    <Drawer placement="right" transitionType="fly" {transitionParams} bind:hidden={hidden1} id='sidebar1'>
        <div class='flex items-center'>
            <h5
                id="drawer-label"
                class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
                <svg class="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>Request Enrollment Support
            </h5>
            <CloseButton on:click={() => (hidden1 = true)} class='mb-4 dark:text-white'/>
        </div>
        <Label class="mt-3 mb-2">Trial ID</Label>
        <Input class="mb-1" bind:value={utn} disabled={true}></Input>
        <Label class="mt-3 mb-2">Preferred Trial Site*</Label>
        <TrialSiteAutocomplete utn={utn} bind:selectedValue={selectedSite}/>
        <Label class="mt-3 mb-2">Diagnosis*</Label>
        <SearchAutocomplete bind:selectedValue={selectedCondition}/>
        <Label class="mt-3 mb-2">What would you like our help with?</Label>
        <Textarea
          class="h-40 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="text-Input"
          type="text"
          placeholder="Your request"
          bind:value={requestText}
        />
        
        <h3 class="mb-1 mt-6 text-l font-semibold text-gray-500 dark:text-gray-400">Your contact details</h3>
        <Alert color="red" class="mb-4">
          Please review your contact details as we may need to ask you for additional information in order to respond to your request.
        </Alert>
        <Label class="mt-3 mb-2">E-mail*</Label>
        <Input class="mb-1" type="email" placeholder="Your e-mail" bind:value={email}/>
        <div class="grid grid-cols-2 gap-4 mt-2">
            <ApiButton class="w-full mt-4" text="Request" onClick={() => requestAccess()} loading={requesting} disabled={!email || !selectedCondition || !selectedSite}/>
        </div>
        <Toast bind:open={show} color={toast_color} class="mt-4">
            {toast_message}
        </Toast>
        
    </Drawer>