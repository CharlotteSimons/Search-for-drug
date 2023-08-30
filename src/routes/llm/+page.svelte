<script>
  import { Textarea, Alert, Label, Select, NumberInput, Helper } from 'flowbite-svelte';
  import SearchAutocomplete from '../../components/SearchAutocomplete.svelte';
  import CountryAutocomplete from '../../components/CountryAutocomplete.svelte';
  import ApiButton from '../../components/ApiButton.svelte';
  import { PUBLIC_SEARCH_API_BASE, PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';
    import { onMount } from 'svelte';

  let selectedGender = null;
  let genders = [
    {value: 'Male', name: "Male"},
    {value: 'Female', name: "Female"}
  ]
  // genderValid is true if gender is not null
  let genderValid = true;

  let selectedCountry = null;
  let countryValid;

  let selectedCondition = null;
  let conditionValid;

  let age = null;
  let ageValid = true;

  let medicalSummary = "";

  let requesting_tsr = false;

  let user_email = null;

  $: searchEnabled = () => {
    return selectedCountry != null && selectedCondition != null && age != null && selectedGender != null;
  }

  function validateForm(selectedCountry, selectedCondition, age, selectedGender) {
    console.log(conditionValid)
    console.log(countryValid)
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

  // Return true if all fields are valid, false otherwise
  return countryValid && conditionValid && ageValid && genderValid;
}

  async function request_tsr(selectedCountry, selectedCondition, age, selectedGender) {
    // Check if all fields are valid
    if (validateForm(selectedCountry, selectedCondition, age, selectedGender)) {
      requesting_tsr = true;
      try {
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

async function getUserEmail() {
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

onMount(() => {
  getUserEmail();
})

</script>

<div class="max-w-5xl mx-auto">
  <!-- Heading section -->
  <section class="text-center my-8">
    <h1 class="text-xl font-bold">AI-supported searching and pre-screening of clinical trials & expanded access programs</h1>
  </section>

  <div class="bg-white my-8 p-6 rounded-md shadow-lg">
  <!-- Grid section -->
  <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
    <!-- Form fields column -->
    <div>
      <div class="mb-4">
        <h3 class="font-bold mb-2">
          Patient Information
        </h3>
        <Label class="mb-2" for="field1">
          Medical Condition *
        </Label>
        <SearchAutocomplete 
        bind:selectedValue={selectedCondition}
        bind:valid={conditionValid}
        />
      </div>
      <div class="mb-4">
        <Label class="mb-2" for="field2">
          Country *
        </Label>
        <CountryAutocomplete 
        bind:selectedValue={selectedCountry}
        bind:valid={countryValid}
        />
      </div>
      <div class="mb-4">
        <Label class="mb-2" for="field3">
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
        <Label class="mb-2" for="field4">
          Gender *
        </Label>
        <Select 
        class="mt-2 bg-white"
        items={genders}
        bind:value={selectedGender}
        />
        {#if genderValid == false}
          <Helper type="error" class="mt-2" color="red"><span class="font-medium">*Please select a valid value from the dropdown.</span></Helper>
        {/if}
      </div>
    </div>

    <!-- Text Input column -->
    <div>
      <div class="mb-4">
        <h3 class="font-bold mb-2" for="text-Input">
          Medical Summary
        </h3>
        <Alert color="red" class="my-2 text-xs">
          <span class="text-xs font-bold">Warning!</span> Do not include data that allows identification of the patient! e.g. their name or date of birth, or very specific medical data.
        </Alert>
        <p class="text-sm mb-4">For the medical summary, provide information on histology, previous treatment, biomarkers (incl. genetic), test values, comorbidities, and overall health (e.g. ECOG-score).</p>
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
  
  <section class="grid grid-cols-1 sm:grid-cols-2 gap-8">
    <div>
      <ApiButton
    color="alternative"
    onClick={() => request_tsr(selectedCountry, selectedCondition, age, selectedGender)}
    loading={requesting_tsr}
    disabled={!searchEnabled()}
    text={"Search"}
    />
    </div>
    <div>
      <ApiButton 
    onClick={() => request_tsr(selectedCountry, selectedCondition, age, selectedGender)}
    loading={requesting_tsr && medicalSummary}
    disabled={!medicalSummary || !searchEnabled()}
    text={"Search and Pre-screen"}
    />
    {#if !medicalSummary || !searchEnabled()}
    <Helper type="info" class="mt-2" color="grey"><span>*Requires both <span class="underline">Patient Information</span> and <span class="underline">Medical Summary</span> to be complete.</span></Helper>
    {/if}
    </div>
  </section>
  
  <section>
    
  </section>
  </div>
</div>