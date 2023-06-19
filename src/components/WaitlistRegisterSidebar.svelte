<script>
    import { Select, Drawer, CloseButton, Input, Label, Checkbox, Button, Toast } from 'flowbite-svelte';
    import { sineIn } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import ApiButton from './ApiButton.svelte';
    import { onMount } from 'svelte';
    import { PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';

    let show = false;
    let counter = 15;

    function trigger() {
        show = true;
        counter = 15;
        timeout();
    }

    function timeout() {
        if (--counter > 0)
        return setTimeout(timeout, 1000);
        show = false;
    }

    export let waitlist_hidden = true;
    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    let email = null;
    let first_name = null;
    let last_name = null;
    let speciality = null;
    let country = null;
    let contact_consent = false;
    let update_consent = false;

    $: formValidated = email && first_name && last_name && speciality && country && contact_consent;

    let toast_color = 'red';
    let toast_message = 'Something went wrong!';
    let registerLoading = false;
    async function registerForWaitlist() {
        registerLoading = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/llm-waitlist/register', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            Email: email,
            FirstMame: first_name,
            LastName: last_name,
            Speciality: speciality,
            Country: country,
            consent: contact_consent,
            LastConsentMarketing: update_consent
        })
        })
        .then(response => response.json())
        .then(data => {
            registerLoading = false;
            if (data.status == 'Succes') {
                // Show toast
                // Reset all values
                email = null;
                first_name = null;
                last_name = null;
                speciality = null;
                country = null;
                contact_consent = false;
                update_consent = false;
                
                toast_message = 'You have been registered for the waitlist!'
                toast_color = 'green';
                trigger();
            } else {
                // Show toast
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        });
    }

    let speciality_options = [];
    let country_options = [];
    async function getLookup(lookup_type) {
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/get_lookup', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            Entity: [
                lookup_type
            ],
            lookup_dict: true
        })
        })
        .then(response => response.json())
        // Data format = results.details.{
            // country: {
                // id_country: int
            // }
            // country2: ...
        // }
        .then(data => {
            let local_lookup = [];
            for (const [key, value] of Object.entries(data.details)) {
                local_lookup.push({
                    value: value[`id_${lookup_type.toLowerCase()}`],
                    id: value[`id_${lookup_type.toLowerCase()}`],
                    name: key
                });
            }
            // sort
            local_lookup.sort((a, b) => (a.name > b.name) ? 1 : -1);
            if (lookup_type == 'Country') {
                country_options = local_lookup;
            } else {
                speciality_options = local_lookup;
            }
            
        });
    }

    onMount(async () => {
        getLookup('Specialization');
        getLookup('Country');
    });

</script>

    <Drawer placement="right" transitionType="fly" {transitionParams} bind:hidden={waitlist_hidden} id='sidebar2' width="w-1/4">
        <div class='flex items-center'>
            <h5
                id="drawer-label"
                class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
                <svg class="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>Waitlist Registration
            </h5>
            <CloseButton on:click={() => (waitlist_hidden = true)} class='mb-4 dark:text-white'/>
        </div>
        <h3 class="text-xl text-blue-500 text mb-4">Be one of the first to experience the power of TrialSearch AI!</h3>
        <p class="text-md mb-6">
            <span>By signing up to the waitlist, you might be one of the first health care professionals to access and test out the beta version of myTomorrows’ TrialSearch AI, an AI powered tool to quickly find clinical trials and/or Expanded Access Programs for your patient.</span><br>
            <span>The myTomorrows’ team will reach out to you through e-mail once your request is reviewed and if you are approved from the waitlist. Thank you for your patience.</span><br>
            <span>As this is a beta version, myTomorrows aims to continuously improve the capabilities of the tool, and thus would like to contact you for your feedback if and after you use the tool. Your feedback is important to us and will help improve the tool before we open it up for general use by physicians.</span><br>
            <span>You may opt-out at any time by sending us an e-mail at beta@mytomorrows.com. View our <a href="https://mytomorrows.com/en/privacy-statement" class="underline text-blue-500">Privacy Statement</a> and <a href="https://agreements-documents.mytomorrows.com/2023.04.11-Terms-of-Use-myTomorrows.pdf" class="underline text-blue-500"> Terms of Use.</a></span>
        </p>
        <Label class="mt-3 mb-2">Email address *</Label>
        <Input class="mb-1" bind:value={email}></Input>
        
        <Label class="mt-3 mb-2">First name *</Label>
        <Input class="mb-1" bind:value={first_name}></Input>

        <Label class="mt-3 mb-2">Last name *</Label>
        <Input class="mb-1" bind:value={last_name}></Input>

        <Label class="mt-3 mb-2">Speciality *</Label>
        <Select class="mb-4" items={speciality_options} bind:value={speciality}></Select>

        <Label class="mt-3 mb-2">Country *</Label>
        <Select class="mb-4" items={country_options} bind:value={country}></Select>

        <Checkbox class="mb-2" checked={contact_consent} on:click={() => {contact_consent = !contact_consent}}><span>I understand that the data provided is personal data of myself. I hereby consent to the processing of my personal data by myTomorrows for the purpose of reaching out to me with respect to my request. I agree that myTomorrows' privacy statmement and cookie statement is applicable to the processing of my personal data. <span class="italic text-red-800">* Required</span></span></Checkbox>

        <Checkbox class="mb-2" checked={update_consent} on:click={() => {update_consent = !update_consent}} >I would like to be kept up-to-date via e-mail with regards to the latest myT HCP portal and other myTomorrows developments.</Checkbox>

        <Toast simple transition={slide} bind:open={show} class="mb-2 mt-2" color={toast_color}>
            <svelte:fragment slot="icon">
            {#if toast_color == 'green'}
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            {:else if toast_color == 'red'}
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            {/if}
            </svelte:fragment>
            {toast_message}
        </Toast>
        <div class="grid grid-cols-2 gap-4 mt-2">
            <ApiButton class="w-full mt-4" text="Request" disabled={!formValidated} loading={registerLoading} onClick={() => registerForWaitlist()}></ApiButton>
        </div>
    </Drawer>