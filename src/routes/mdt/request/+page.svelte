<script>
    import { Button, Label, Input, Helper, Textarea, Heading, Select, P, Toast, Alert } from 'flowbite-svelte'
    import ApiButton from '../../../components/ApiButton.svelte';
    import CountryAutocomplete from '../../../components/CountryAutocomplete.svelte';
    import SearchAutocomplete from '../../../components/SearchAutocomplete.svelte';
    import { onMount } from 'svelte';

    let user_email = null;

    let genders = [
        {value: 'Male', name: "Male"},
        {value: 'Female', name: "Female"}
    ]

    let form = {
    identifier: '',
    disease: null,
    country: null,
    age: '',
    sex: '',
    histology: '',
    previous_treatment: '',
    biomarkers: '',
    test_values: '',
    comorbidities: '',
    overall_health: '',
    other: '',
    };;

  let profiles = [];

  function submitForm() {
    profiles = [...profiles, form]
    clearForm();
  }

  let default_form = {
    identifier: '',
    disease: null,
    country: null,
    age: '',
    sex: '',
    histology: '',
    previous_treatment: '',
    biomarkers: '',
    test_values: '',
    comorbidities: '',
    overall_health: '',
    other: '',
    };

  function clearForm() {
    // Reset form
    form = {
    identifier: '',
    disease: null,
    country: null,
    age: '',
    sex: '',
    histology: '',
    previous_treatment: '',
    biomarkers: '',
    test_values: '',
    comorbidities: '',
    overall_health: '',
    other: '',
    };
  }

  async function getUser() {
    fetch(PUBLIC_MICROSERVICE_API_BASE + "/v1.2.0/api/get_user", {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            token: sessionStorage['hcp.user.session.token']
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
      user_email = data.details.Email1;
    })
    .catch(error => {
      alert(error);
      // Delete the token and redirect to login
      sessionStorage.removeItem('hcp.user.session.token');
      window.location.href = '/mdt';
    });
  }

    let batch_request_successful = false;
  async function request_overviews() {
    // try {
    //   const response = await fetch(PUBLIC_MICROSERVICE_API_BASE + "/v01/trialsearch_ai/batch_request", {
    //     method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({ 
    //         email: user_email,
    //         token: sessionStorage['hcp.user.session.token'],
    //         requests: profiles
    //       })
    //   });

    //   // Get result. If status_code > 300, throw error with body.error
    //   // else, result = response.json()
    //   const result = await response.json();
    //   if (response.status > 300) {
    //     throw new Error(result.error);
    //   }

    //     // Show success message
        batch_request_successful = true;
    // } catch (error) {
    //   alert(error);
    // }
  }

    // hcp.user.session.token check if the user is logged in
  onMount(() => {
    if (sessionStorage['hcp.user.session.token'] == null) {
      window.location.href = '/mdt';
    } else {
      getUser();
    }
  })
</script>

<div class="max-w-3xl mx-auto my-8 bg-white p-8 rounded-lg">
    <section class="mb-6">
    <Heading tag="h1" customSize="text-3xl font-extrabold" class="mb-6">Request Form:<br> Pre-approval treatment option overviews</Heading>
    <P>Please complete one form for each patient. After completion of all forms, you can submit the full batch at once.</P>
    </section>
    <div class="w-full h-0 border border-gray-100 my-6"></div>
    <section>
    <Heading tag="h2" customSize="text-2xl font-bold" class="my-4">Complete patient profile</Heading>
    <form on:submit|preventDefault={() => submitForm()}>
        <Alert color="red" class="mt-4 mb-6">
          <span class="font-bold">Warning</span> Do not include data that allows identification of the patient; e.g. their name or date of birth, or very specific medical data.
        </Alert>
    <div class="mb-6">
        <Label class ="block mb-2">Patient Identifier *</Label>
        <Input bind:value={form.identifier} placeholder="ID0123456789" required/>
        <Helper class="mt-1">Do not use personal identifiable identifiers like date of birth.</Helper>
    </div>
    
    <!-- Grid of 2 x 2 -->
    <div class="grid grid-cols-2 gap-4">
    <div class="">
        <Label class ="block mb-2">Disease *</Label>
        <SearchAutocomplete bind:selectedValue={form.disease} placeholder="Disease" required/>
    </div>
    <div class="">
        <Label class ="block mb-2">Country *</Label>
        <CountryAutocomplete bind:selectedValue={form.country} placeholder="Country" required/>
    </div>
    <div class="">
        <Label class ="block mb-2">Age *</Label>
        <Input bind:value={form.age} type="number" placeholder="Age" required/>
    </div>
        <div class="">
        <Label class ="block mb-2">Biological Sex *</Label>
        <Select items={genders} bind:value={form.sex} required/>
    </div>
    </div>
    <div class="w-full h-0 border border-gray-100 my-6"></div>

    <!-- List of fields -->
    <div class="mb-6">
        <Label class ="block mb-2">Histology</Label>
        <Textarea bind:value={form.histology} placeholder="e.g. T/N/M, location of tumor"/>
    </div>
    <div class="mb-6">
        <Label class ="block mb-2">Previous Treatment</Label>
        <Textarea bind:value={form.previous_treatment} placeholder="e.g. FOLFIRINOX etc"/>
    </div>
    <div class="mb-6">
        <Label class ="block mb-2">Biomarkers & Mutations</Label>
        <Textarea bind:value={form.biomarkers} placeholder="e.g. KRAS G12C, triple negative etc"/>
    </div>
    <div class="mb-6">
        <Label class ="block mb-2">Test & Lab Values</Label>
        <Textarea bind:value={form.test_values} placeholder="eGFR etc."/>
    </div>
    <div class="mb-6">
        <Label class ="block mb-2">Comorbidities</Label>
        <Textarea bind:value={form.comorbidities} placeholder="e.g. depression, hypertension etc"/>
    </div>
    <div class="mb-6">
        <Label class ="block mb-2">Overall Health</Label>
        <Textarea bind:value={form.overall_health} placeholder="e.g. ECOG, ambulatory status"/>
    </div>
    <div class="mb-6">
        <Label class ="block mb-2">Other notable details</Label>
        <Textarea bind:value={form.other} placeholder="e.g. Pregnancy"/>
    </div>
    <Button type="submit">Submit Patient</Button>
    <Button color="alternative" on:click={() => clearForm()}>Clear form</Button>
    </form>
    </section>
    <div class="w-full h-0 border border-gray-100 my-6"></div>

    <!-- Request all profiles -->
    <section>
        <ApiButton onClick={() => request_overviews()} disabled={profiles.length < 1 || JSON.stringify(form) !== JSON.stringify(default_form)} text="Request {profiles.length} overviews"/>
        {#if JSON.stringify(form) !== JSON.stringify(default_form)}
        <Helper class="mt-2 text-red-700">Please submit the patient profile before requesting the overviews.</Helper>
        {/if}

        <!-- Success on API call -->
        <Toast color="green" bind:open={batch_request_successful} class="mt-4">
        <svelte:fragment slot="icon">
            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Check icon</span>
        </svelte:fragment>
        Your overviews have been requested, you will receive an email when they are ready.
        </Toast>
    </section>
</div>

