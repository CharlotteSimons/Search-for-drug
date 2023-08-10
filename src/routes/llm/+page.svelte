<script>
  import { Textarea, Alert, Label, Select, NumberInput, Helper } from 'flowbite-svelte';
  import SearchAutocomplete from '../../components/SearchAutocomplete.svelte';
  import CountryAutocomplete from '../../components/CountryAutocomplete.svelte';
  import ApiButton from '../../components/ApiButton.svelte';
  import { onMount } from 'svelte';
  import { PUBLIC_SEARCH_API_BASE, PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';

  let selectedGender;
  let genders = [
    {value: 'Male', name: "Male"},
    {value: 'Female', name: "Female"}
  ]
  // genderValid is true if gender is not null
  let genderValid = true;
  $: genderValid = selectedGender != null;

  let selectedCountry = null;
  let countryValid = true;

  let selectedCondition = null;
  let conditionValid = true;

  let age = null;
  let ageValid = true;

  let medicalSummary = "";

  let requesting_tsr = false;

  let user_email = null;

  async function request_tsr(selectedCountry, selectedCondition, age, selectedGender) {
    // Check if all fields are valid
    if (selectedCountry == null) {
      countryValid = false;
    }
    if (selectedCondition == null) {
      conditionValid = false;
    }
    if (age == null) {
      ageValid = false;
    }
    if (selectedGender == null || selectedGender == '') {
      genderValid = false;
    }
    // Only make the API-call if all fields are valid
    if (countryValid && conditionValid && ageValid && genderValid) {
      requesting_tsr = true;
      try {
        console.log(user_email)
        const response = await fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/request_tsr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            condition: selectedCondition,
            country: selectedCountry,
            age: age,
            gender: selectedGender,
            profile: medicalSummary,
            email: user_email,
            token: localStorage['hcp.user.session.token']
           })
        });

        // Get result. If status_code > 300, throw error with body.error
        // else, result = response.json()
        const result = await response.json();
        if (response.status > 300) {
          throw new Error(result.error);
        }

        // Redirect to llm/results
        window.location.href = `/llm/results?uuid=${result.uuid}`;
      } catch (error) {
        alert(error);
      }
    }
}

  async function getUser() {
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
      user_email = data.details.Email1;
    })
    .catch(error => {
      alert(error);
      // Delete the token and redirect to login
      localStorage.removeItem('hcp.user.session.token');
      window.location.href = '/';
    });
  }

  // hcp.user.session.token check if the user is logged in
  onMount(() => {
    if (localStorage['hcp.user.session.token'] == null) {
      window.location.href = '/';
    } else {
      getUser();
    }
  })
</script>

<div class="max-w-5xl mx-auto">
  <!-- Heading section -->
  <section class="text-center my-8">
    <h1 class="text-xl font-bold">AI-supported searching and pre-screening of clinical trials & expanded access programs</h1>
  </section>

  <div class="bg-white my-8 p-6 rounded-md shadow-lg">
  <!-- Grid section -->
  <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    <!-- Form fields column -->
    <div>
      <div class="mb-4">
        <Label class="block text-gray-700 font-bold mb-2" for="field1">
          Medical Condition *
        </Label>
        <SearchAutocomplete 
        bind:selectedValue={selectedCondition}
        valid={conditionValid}
        />
      </div>
      <div class="mb-4">
        <Label class="block text-gray-700 font-bold mb-2" for="field2">
          Country *
        </Label>
        <CountryAutocomplete 
        bind:selectedValue={selectedCountry}
        valid={countryValid}
        />
      </div>
      <div class="mb-4">
        <Label class="block text-gray-700 font-bold mb-2" for="field3">
          Age *
        </Label>
        <NumberInput
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
          id="field3"
          type="text"
          placeholder="Enter the age"
          bind:value={age}
          on:blur={() => {
            if (age == null) {
              ageValid = false;
            } else {
              ageValid = true;
            }
          }}
        />
        {#if !ageValid}
          <Helper type="error" class="mt-2" color="red"><span class="font-medium">*Please input the age.</span></Helper>
        {/if}
      </div>
      <div class="mb-4">
        <Label class="block text-gray-700 font-bold mb-2" for="field4">
          Gender *
        </Label>
        <Select 
        class="mt-2 bg-white"
        items={genders}
        bind:value={selectedGender}
        />
        {#if !genderValid}
          <Helper type="error" class="mt-2" color="red"><span class="font-medium">*Please select a valid value from the dropdown.</span></Helper>
        {/if}
      </div>
    </div>

    <!-- Text Input column -->
    <div>
      <div class="mb-4">
        <Label class="block text-gray-700 font-bold mb-2" for="text-Input">
          Medical Summary
        </Label>
        <Alert color="red" class="my-2 text-xs">
          <span class="text-xs font-bold">Warning!</span> Do not include data that allows identification of the patient! e.g. their name or date of birth, or very specific medical data.
        </Alert>
        <p class="text-xs mb-4">For the medical summary, provide information on histology, previous treatment, biomarkers (incl. genetic), test values, comorbidities, and overall health (e.g. ECOG-score).</p>
        <Textarea
          class="h-36 appearance-none border rounded w-full px-3 placeholder:text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-white"
          id="text-Input"
          type="text"
          placeholder="- Histology
- Previous treatment
- Biomarkers
- Test values
- Comorbidities
- Overall health (e.g. ECOG-score)
- Other"
          bind:value={medicalSummary}
        />
      </div>
    </div>
  </section>
  <section class="mb-4">
    <ApiButton 
    onClick={() => request_tsr(selectedCountry, selectedCondition, age, selectedGender)}
    loading={requesting_tsr}
    text={"Initiate pre-screener"}
    />
  </section>
  </div>
</div>