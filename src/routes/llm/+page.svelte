<script>
  import { Textarea, Alert, Label, Select, NumberInput, Helper } from 'flowbite-svelte';
  import SearchAutocomplete from '../../components/SearchAutocomplete.svelte';
  import CountryAutocomplete from '../../components/CountryAutocomplete.svelte';
  import ApiButton from '../../components/ApiButton.svelte';
  import { onMount } from 'svelte';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';

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
            email: "danny.den.hamer@mytomorrows.com",
            token: sessionStorage['hcp.user.session.token']
           })
        });
        const result = await response.json();
        // Redirect to llm/review
        window.location.href = `/llm/review?uuid=${result.uuid}`;
      } catch (error) {
        console.log(error)
        alert(error);
      }
    }
}
  // hcp.user.session.token check if the user is logged in
  onMount(() => {
    if (sessionStorage['hcp.user.session.token'] == null) {
      console.log('User is not logged in')
      window.location.href = '/';
    }
  })
</script>

<div class="max-w-5xl mx-auto">
  <!-- Heading section -->
  <section class="text-center py-8">
    <h1 class="text-3xl font-bold">AI-supported pre-screening of clinical trials & expanded access programs</h1>
  </section>

  <!-- Rich text section -->
  <section class="border border-gray-300 rounded-lg p-4 mb-8 bg-white">
    <h3 class="text-xl font-bold mb-4">Instructions</h3>
    <!-- Rewrite this paragraph in markdown -->
    <p class="mb-4">myTomorrows have developed TrialSearch AI, an AI-supported pre-screening tool to allow you to quickly identify potential clinical trials and expanded access programs for your patients. The tool assists the physician in categorizing pre-approval options into two categories, "potentially eligible" and "ineligible".</p>
    <p class="mb-4">Here are the steps to use the tool:</p>
    <ol class="list-decimal list-inside">
      <li class="p-2">Fill in basic non-identifiable patient details on the left-hand side of the screen.</li>
      <li class="p-2">Provide the medical summary of the patient on the right-hand side. Generally useful Input or data points relate to the patient’s <strong>histology, previous treatment, biomarkers (incl. genetic), test values, comorbidities, and overall health</strong> (e.g. ECOG-score).</li>
      <li class="p-2">Click on the Initiate pre-screener button to start the search. The tool will search for studies and, based on your Input, check the patient's potential eligibility in the background.</li>
      <li class="p-2">The next step is for you to review eligibility criteria which the AI indicated your patient does not meet, to ensure the output is reviewed and correct. This step will additionally show you the AI’s reasoning, to assist you in your review.</li>
      <li class="p-2">After this, your overview of potential clinical trials and/or Expanded Access Programs is ready.</li>
    </ol>

  </section>

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
        <Alert color="red" class="mb-4">
          <span class="font-medium">Warning!</span> Do not include data that allows identification of the patient! e.g. their name or date of birth, or very specific medical data.
        </Alert>
        <Textarea
          class="h-40 appearance-none border rounded w-full py-2 px-3 placeholder:text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-white"
          id="text-Input"
          type="text"
          placeholder="Histology: Squamous cell carcinoma of the cervix metastasized to pelvic lymph nodes 
Previous treatment: carboplatin/paclitaxel/bevacizumab/Keytruda and radiotherapy
Biomarkers: HPV16-
Comorbidities: Diabetes Mellitus Type 1
Other: ECOG 0"
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