<script>
  import TrialSearchAITable from '../../../components/TrialSearchAITable.svelte';
  import { Tabs, TabItem, Spinner } from 'flowbite-svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';
  import DownloadButton from '../../../components/DownloadButton.svelte';

  let medical_profile = null;
  let trialsearch_ai = null;
  let prescreening_enabled = false;
  
  $: eligible = trialsearch_ai ? trialsearch_ai.eligibility.eligible : null;
  $: ineligible = trialsearch_ai ? trialsearch_ai.eligibility.ineligible : null;

  $: eligibleStudies = data ? data.filter(study => eligible.includes(study.id)) : [];
  $: ineligibleStudies = data ? data.filter(study => ineligible.includes(study.id)) : [];

  let token = null
  let data;
  let error;

  let intervalId = null;

  // TrialSearch AI table might have newly marked ineligible studies
  // We remove these from eligible and add to ineligible
  let ineligible_utns = [];

  $: if (ineligible_utns && ineligible_utns.length > 0) {
    eligible = eligible.filter(id => !ineligible_utns.includes(id));
    ineligible = ineligible.concat(ineligible_utns);
  }

  let loading_trials = false;
  async function fetchData() {
    if (eligible === null && !loading_trials && !trials_initialised) {
      return;
    }
    loading_trials = true;
    try {
      let all_ids = eligible.concat(ineligible)
      all_ids = all_ids.join('","')
      let queryStr = `query {
      studies(where: {id_IN: ["${all_ids}"]}, options: {sort: {phase: DESC}}) {
        id
        title
        overall_status
        reports_as_closed
        phase
        interventions
        }
      }`
      const response = await fetch(PUBLIC_SEARCH_API_BASE + '/gql/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: queryStr })
      });

      const result = await response.json();

      if (result.errors) {
        error = result.errors[0].message;
      } else {
        data = result.data.studies;
        trials_initialised = true;
        loading_trials = false;
      }
    } catch (err) {
      error = err.message;
    }
  }

  // Load the data from the API, don't use interval
  $: condition = medical_profile ? medical_profile.condition : null;
  let loading = false;
  let trials_initialised = false;
  let tsai_status = null;

  const uuid = $page.url.searchParams.get('uuid');

  // Function to fetch data
  function request_trialsearchai(uuid, token) {
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
      medical_profile = data.medical_profile;
      trialsearch_ai = data.trialsearch_ai;
      tsai_status = data.request_status;

      
      if (!trials_initialised && trialsearch_ai && trialsearch_ai.eligibility) {
        eligible = trialsearch_ai.eligibility.eligible;
        ineligible = trialsearch_ai.eligibility.ineligible;
        fetchData();
      }

      if (data.request_status !== 'not_yet_started') {
        prescreening_enabled = true;
      }

      if (data.request_status == 'completed' || data.request_status == 'not_yet_started') {
        clearInterval(intervalId);
        loading = false;
      }
    })
    .catch((error) => {
        alert(error);
    });
  }
}

  function initiateInterval(uuid, token) {
    request_trialsearchai(uuid, token);
  const interval = setInterval(() => {
      request_trialsearchai(uuid, token);
  }, 10000);
  return interval;
}

  onMount(() => {
    loading = true;
    intervalId = initiateInterval(uuid, token);
  })
</script>

<main>
<div class="p-8 w-full">
  <section>
      <a href="/llm" class="text-slate-700 text-l font-bold underline mb-6">Back to start</a>
  </section>
  <section class="my-6">
    {#if trials_initialised}
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-2xl font-bold mb-4">{eligibleStudies.length + ineligibleStudies.length} results for {medical_profile.condition} in {medical_profile.country}</h3>
      <DownloadButton
        patient_id={uuid}
        eligible={eligible}
        ineligible={ineligible}
        country={medical_profile.country}
        disease={medical_profile.condition}
        medical_summary={medical_profile.profile}
      />
    </div>
    {/if}
    <!-- Medical Profile Section -->
    {#if medical_profile}
    <div class="p-4 bg-white shadow-md rounded-sm">
      <div>
        <h3 class="font-bold mb-2">Medical Profile</h3>
        <span>{medical_profile.gender} aged {medical_profile.age}.</span>
        <span>{medical_profile.profile}</span>
      </div>
    </div>
    {/if}

  </section>
  <div class="mt-6">
    <Tabs contentClass="bg-gray-50 rounded-lg dark:bg-gray-800 mt-4">
      <TabItem open>
        <span slot="title" class="text-lg fond-bold">Potentially Eligible ({eligibleStudies.length})</span>
        {#if error}
        <p>{error}</p>
      {:else if data}
        <TrialSearchAITable data={eligibleStudies} {uuid} drugData={true} {condition} trialsearch_ai={trialsearch_ai} {prescreening_enabled} bind:ineligible_utns/>
      {/if}
    </TabItem>
    <TabItem>
      <span slot="title" class="text-lg fond-bold">Marked as Ineligible ({ineligibleStudies.length})</span>
      {#if error}
        <p>{error}</p>
      {:else if data && ineligibleStudies.length > 0}
        <TrialSearchAITable data={ineligibleStudies} {uuid} drugData={true} {condition} trialsearch_ai={trialsearch_ai} {prescreening_enabled}/>
      {:else}
        <p>No studies found</p>
      {/if}
    </TabItem>
  </Tabs>
</div>
  {#if !trials_initialised && loading_trials}
  <div class="flex justify-center items-center">
    <span class="text-gray-400"><Spinner size="4" class="mr-2"/>Loading...</span>
  </div>
  {/if}
</div>
</main>
