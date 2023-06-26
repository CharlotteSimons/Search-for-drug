<script>
    import { Skeleton } from "flowbite-svelte";
    import {onMount} from 'svelte';
    import LlmHighlightedCriterion from "./LLMHighlightedCriterion.svelte";
    import ApiButton from "./ApiButton.svelte";
    import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';


    export let uuid;
    export let utn;

    let inclusion_criteria = null;
    let inclusion_not_matched = null;

    let exclusion_criteria = null;
    let exclusion_not_matched = null;

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
            token: sessionStorage['hcp.user.session.token']
        })
      })
      .then(response => response.json())
      .then(data => {
        fullPayload = data;
        // If human_eligibility, use that as eligiblity
        if (data.tsr.criteria_per_trial[utn].human_eligibility !== undefined) {
            eligibility = data.tsr.criteria_per_trial[utn].human_eligibility;
        } else {
            eligibility = data.tsr.criteria_per_trial[utn].eligibility;
        }

        inclusion_not_matched = data.tsr.criteria_per_trial[utn].inclusion.not_matched_criterias;
        inclusion_criteria = Object.keys(data.tsr.criteria_per_trial[utn].inclusion.criterias).map(function(key) {
            return data.tsr.criteria_per_trial[utn].inclusion.criterias[key];
        });
        exclusion_not_matched = data.tsr.criteria_per_trial[utn].exclusion.not_matched_criterias;
        exclusion_criteria = Object.keys(data.tsr.criteria_per_trial[utn].exclusion.criterias).map(function(key) {
            return data.tsr.criteria_per_trial[utn].exclusion.criterias[key];
        });
        loading = false;
      })
      .catch((error) => {
        alert('Something went wrong, please try again later.');
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
        fetch(PUBLIC_SEARCH_API_BASE + '/llm/review_tsr', {
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
        <h2 class="text-2xl font-bold mb-4">Eligibility Criteria</h2>
        <ApiButton onClick={() => updateTrialEligibility()} text={buttonText} color={buttonColor} loading={updateLoading}></ApiButton>
    </div>
    {#if loading}
        <Skeleton />
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
