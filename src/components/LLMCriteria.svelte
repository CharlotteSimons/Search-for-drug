<script>
    import { Skeleton, P } from "flowbite-svelte";
    import {onMount} from 'svelte';
    import LlmHighlightedCriterion from "./LLMHighlightedCriterion.svelte";
    import ApiButton from "./ApiButton.svelte";
    import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';


    export let uuid;
    export let utn;
    export let raw_criteria;

    let use_plain_criteria = false;

    let inclusion_criteria = null;
    let inclusion_not_matched = null;
    let raw_inclusion_criteria = null

    let exclusion_criteria = null;
    let exclusion_not_matched = null;
    let raw_exclusion_criteria = null

    let eligibility = null;

    let fullPayload = null;

    let loading = true;
    // Load the data from the API, don't use interval
  async function loadResults() {
        fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/request_tsr',
                {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            uuid: uuid,
            trial_id: utn,
            token: localStorage['hcp.user.session.token']
        })
      })
        // Check if status_code > 300
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
        fullPayload = data;
        let json_load = JSON.parse(raw_criteria);
        raw_inclusion_criteria = json_load.inclusion;
        raw_exclusion_criteria = json_load.exclusion;
        // Check if data.trialsearch_ai[utn] is not empty or an empty object
        if (data.trialsearch_ai[utn] && Object.keys(data.trialsearch_ai[utn]).length !== 0) {
          if (data.trialsearch_ai[utn].human_eligibility !== undefined) {
              eligibility = data.trialsearch_ai[utn].human_eligibility;
          } else {
              eligibility = data.trialsearch_ai[utn].eligibility;
          }
  
          inclusion_not_matched = data.trialsearch_ai[utn].screened_criteria.inclusion.not_matched_criterias;
          inclusion_criteria = Object.keys(data.trialsearch_ai[utn].screened_criteria.inclusion.criterias).map(function(key) {
              return data.trialsearch_ai[utn].screened_criteria.inclusion.criterias[key];
          });
          exclusion_not_matched = data.trialsearch_ai[utn].screened_criteria.exclusion.not_matched_criterias;
          exclusion_criteria = Object.keys(data.trialsearch_ai[utn].screened_criteria.exclusion.criterias).map(function(key) {
              return data.trialsearch_ai[utn].screened_criteria.exclusion.criterias[key];
          });
          loading = false;
        } else {
          use_plain_criteria = true;
          loading = false;
        }
      })
      .catch((error) => {
        alert('Something went wrong. Please contact beta@mytomorrows.com.');
      });
        

  };

    // If potentially eligible, show button to mark as Ineligible
    // If not potentially eligible, show button to mark as Eligible
    $: buttonText = eligibility === 'Potentially eligible' ? 'Mark as Ineligible' : 'Mark as Eligible';
    $: buttonColor = eligibility === 'Potentially eligible' ? 'red' : 'green';
    $: humanEligibility = eligibility === 'Potentially eligible' ? false : true;

    let updateLoading = false;
    async function updateTrialEligibility() {
        updateLoading = true;
        fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/review_tsr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        uuid: uuid,
        review_type: "trial",
        review: {
            utn: utn,
            human_eligibility: humanEligibility
        }
    })
        })
        // Check if status_code > 300
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
        eligibility = eligibility === 'Potentially eligible' ? 'Ineligible' : 'Potentially eligible';
        updateLoading = false;
      })
        .catch((error) => {
            alert('Something went wrong, please try again later.');
        });
  };

    onMount(() => {
        loadResults();
    });


</script>

<div>
    <!-- Spread h2 and api button -->
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold mb-4 text-blue-500">Eligibility Criteria</h2>
        {#if !use_plain_criteria && !loading}
        <ApiButton onClick={() => updateTrialEligibility()} text={buttonText} color={buttonColor} loading={updateLoading}></ApiButton>
        {/if}
    </div>
    {#if loading}
        <Skeleton />
    {:else if use_plain_criteria || inclusion_not_matched !== '' || exclusion_not_matched !== ''}
      <P>
        <h3 class="text-xl font-bold mb-4 mt-4">Inclusion Criteria</h3>
        <ol class="list-disc ml-8">
            {#each raw_inclusion_criteria as criterion}
              <!-- Check if cleaned string is not empty -->
              {#if criterion.replace(/\s/g, '') !== ''}
                <li class="mt-1">{criterion}</li>
              {/if}
            {/each}
        </ol>
        <h3 class="text-xl font-bold mb-4 mt-4">Exclusion Criteria</h3>
        <ol class="list-disc ml-8">
            {#each raw_exclusion_criteria as criterion}
              <!-- Check if cleaned string is not empty -->
              {#if criterion.replace(/\s/g, '') !== ''}
                <li class="mt-1">{criterion}</li>
              {/if}
            {/each}
        </ol>
      </P>
    {:else}
        
        <h3 class="text-xl font-bold mb-4 mt-4">Inclusion Criteria</h3>
        {#if inclusion_not_matched !== ''}
            <p class="text-red-500">We were unable to automatically review all criteria, please review them manually. </p><br>
        {/if}
        <ol class="list-decimal ml-4">
            {#each inclusion_criteria as criterion}
                <LlmHighlightedCriterion criterion={criterion} />
            {/each}
        </ol>
        <h3 class="text-xl font-bold mb-4 mt-4">Exclusion Criteria</h3>
        <ol class="list-decimal ml-4">
            <!-- If exclusion contains "(E2)" -->
            {#if exclusion_not_matched === '*We were unable to automatically find any relevannt exclusion criteria (E2). Please manually check the trial.*'}
                <p class="text-red-500">We were unable to automatically find any screenable exclusion criteria (E2). Please manually check the trial.</p>
                <!-- Split the  exclusion_criteria string into a list by token \n -->
                {#each fullPayload.tsr.criteria_per_trial[utn].exclusion.criterias.split('\n') as criterion}
                    {#if criterion !== ''}
                        <LlmHighlightedCriterion criterion={{criteria: criterion, answer: null, explanation: null}} />
                    {/if}
                {/each}
            {:else if exclusion_not_matched !== ''}
                <li class="text-red-500">Not matched: {exclusion_not_matched}</li>
            {:else}
                {#each exclusion_criteria as criterion}
                    <LlmHighlightedCriterion criterion={criterion} />
                {/each}
            {/if}
        </ol>
    {/if}
</div>
