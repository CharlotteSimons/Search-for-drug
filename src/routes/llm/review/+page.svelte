<script>
    import { page } from '$app/stores';
    import { Spinner, Radio, Button, Alert } from "flowbite-svelte";
    import ApiButton from '../../../components/ApiButton.svelte';
    import { onMount } from 'svelte';
    import LlmLoaderComponent from '../../../components/LLMLoaderComponent.svelte';
    import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';

    let token = null

    let loading = true;
    let medical_profile = null;
    let to_review = null;
    let current_review_index = null;
    
    const uuid = $page.url.searchParams.get('uuid');

    let human_answer = null;

    function answerByInex(inex, eligible) {
      if (eligible === 'Unknown') { 
      } else if (inex === "inclusion") {
        return eligible
      } else if (inex === "exclusion" && eligible === true) {
        return false
      } else if (inex == "exclusion" && eligible === false) {
        return true
      }
    }

    // While loading, every 10 seconds call the API to check if the AI has finished
    const interval = setInterval(() => {
        if (loading) {
            fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/request_tsr', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ 
                    uuid: uuid,
                    token: token
                  })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.status == 'review') {
                    medical_profile = data.tsr.medical_profile;
                    to_review = data.to_review;
                    current_review_index = 0;
                    human_answer = answerByInex(to_review[current_review_index].inex, false);
                    clearInterval(interval);
                    loading = false;
                  } else if (data.status == 'completed') {
                    medical_profile = data.tsr.medical_profile;
                    clearInterval(interval);
                    loading = false;
                    to_review = [];
                    current_review_index = -1;
                  }
                });
        }
    }, 2000);

    let reviewing = false;
    function review() {
        let current_review = to_review[current_review_index];
        current_review.human_answer = human_answer;
        reviewing = true;
        fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/review_tsr',
                  {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                uuid: uuid,
                review_type: "criteria",
                review: current_review
              })
            })
            .then(response => response.json())
            .then(data => {
                if (current_review_index < to_review.length - 1) {
                    current_review_index = current_review_index + 1;
                    human_answer = answerByInex(to_review[current_review_index].inex, false);
                    reviewing = false;
                } else {
                    // Redirect to /llm/complete
                    window.location.href = '/llm/results?uuid=' + uuid;
                }
            });
    }

    // hcp.user.session.token check if the user is logged in
    onMount(() => {
    if (sessionStorage['hcp.user.session.token'] == null) {
      console.log('User is not logged in')
      window.location.href = '/';
    } else {
      token = sessionStorage['hcp.user.session.token'];
    }
    })

</script>
<div class="max-w-5xl mx-auto">
  <!-- Heading section -->
  <section class="text-center py-8">
    <h1 class="text-3xl font-bold">Physician review of not-met criteria</h1>
  </section>

  <!-- Rich text section -->
  <section class="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
    <h3 class="text-xl font-bold mb-4">Instructions</h3>
    <!-- Rewrite this paragraph in markdown -->
    <p class="mb-4">myTomorrows’ TrialSearch AI has found trials that your patient may qualify for and trials for which they may not be eligible, based on the data you provided. As with any search or AI-supported tool, there is a possibility of inaccuracies. We kindly ask you to verify the search results and criteria that resulted in your patient being deemed ineligible for specific trials.</p>
    <p class="mb-4">Please proceed with the following steps:</p>
    <p class="mb-4">1. Review the criteria for the trials marked as potentially eligible or ineligible to ensure that no potentially suitable trial has been inadvertently excluded.</p>
    <p class="mb-4">2. Examine the list of trials and expanded access programs for which the patient may be eligible and determine whether you deem such trial or program suitable for your patient.</p>
  </section>

  {#if loading}
    <!-- <section class="border border-gray-300 rounded-lg p-4"> -->
      <!-- Spread items -->
      <!-- </section> -->
    <div class="flex flex-col items-center">
        <Alert color="dark">
            <div class="flex items-center text-slate-600">
            <Spinner class="mr-4" size="10"/>
            <p><strong>AI pre-screening in progress:</strong> average waiting time is 2 minutes.</p>
          <div>
        </Alert>
            <!-- <h3 class="text-xl mb-4">Loading...</h3> -->
            <LlmLoaderComponent/>
    </div>

  {:else}
  <!-- Two cols one 2/3 and one 1/3 -->
  {#if current_review_index > -1}
  <section class="border border-gray-300 rounded-lg p-4 mb-8">
      <div class="flex mb-4">
        <div class="w-2/3">
            <p class="mb-2">{current_review_index + 1}. {to_review[current_review_index].inex} criterion</p>
            <p class="mb-2"><strong>{to_review[current_review_index].to_review.criteria}</strong></p>
            <p class="mb-2">Based on this inclusion criterion, is the patient NOT ELIGIBLE for <a class='underline' href="https://search.mytomorrows.com/en/study-details?studyId={to_review[current_review_index].utn}">{to_review[current_review_index].utn}</a>?</p>
            <div>
              <form>
                <div class='flex flex-col p-4 mb-4 bg-[#F2F3EF]'>
                <Radio class='hover:cursor-pointer' bind:group={human_answer} disabled={reviewing} value={answerByInex(to_review[current_review_index].inex, false)}>Based on this criterion the patient is NOT ELIGIBLE.</Radio>
                <div class='bg-[#FFFFFF] p-2 mt-2'>
                  <h3 class="text-l font-bold mb-2">Explanation by AI</h3>
                  <p >{to_review[current_review_index].to_review.explanation}</p>
                </div>
                </div>
                <Radio bind:group={human_answer} disabled={reviewing} value={answerByInex(to_review[current_review_index].inex, true)} class="p-4 mb-4 bg-[#F2F3EF] hover:cursor-pointer">Based on this criterion the patient may still be ELIGIBLE.</Radio>
                <Radio bind:group={human_answer} disabled={reviewing} value={answerByInex(to_review[current_review_index].inex, "Unknown")} class="p-4 mb-4 bg-[#F2F3EF] hover:cursor-pointer">Based on this criterion, I'm NOT SURE if the patient is eligible.</Radio>
              </form>
            </div>
        </div>
        <div class="w-1/3">
          <div class="border border-gray-300 rounded-sm m-4">
            <h3 class="text-l font-bold m-4">Medical Summary</h3>
            <ol class="list-disc">
              <li class='ml-8 pb-2'>{medical_profile.gender}, {medical_profile.age} years old.</li>
              <li class='ml-8 pb-2'>Diagnosis: {medical_profile.condition}</li>
              <li class='ml-8 pb-2'>{medical_profile.profile}</li>
            </ol>
          </div>
        </div>
      </div>
      <div class="flex justify-between">
        <Button text={"Previous"} disabled={current_review_index < 1}>Previous</Button>
        <p><strong>{current_review_index + 1} of {to_review.length} criteria</strong></p>
        <ApiButton text={"Next"} onClick={() => review()} loading={reviewing}/>
      </div>
    </section>
      {:else}
      <!-- # Center items -->
      <div class="border-blue-500 border-2 text-l bg-green-50 rounded-xl p-4 mb-8 ml-16 mr-16 text-center">
        <h3 class="mb-4 text-l">No unmet criteria were identified by TrialSearch AI. Please continue to review the overview of clinical trials and expanded access programs.</h3>
        <Button text={"Continue"} href={"/llm/results?uuid=" + uuid}/>
      </div>
      {/if}
    {/if}
</div>