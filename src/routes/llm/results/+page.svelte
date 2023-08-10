<script>
  import TrialSearchAITable from '../../../components/TrialSearchAITable.svelte';
  import { Tabs, TabItem, Spinner } from 'flowbite-svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';

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

      if (!trials_initialised && trialsearch_ai) {
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
        console.error('Error:', error);
        alert(error);
    });
  }
}

  function initiateInterval(uuid, token) {
    request_trialsearchai(uuid, token);
  const interval = setInterval(() => {
      console.log("Retrieving TrialSearch AI results")
      request_trialsearchai(uuid, token);
  }, 10000);
  return interval;
}


  // hcp.user.session.token check if the user is logged in
  onMount(() => {
    if (sessionStorage['hcp.user.session.token'] == null) {
      console.log('User is not logged in')
      window.location.href = '/';
    } else {
      token = sessionStorage['hcp.user.session.token'];
      loading = true;
      intervalId = initiateInterval(uuid, token);
    }
  })
</script>

<main>
<div class="p-8 w-full">
  <section>
      <a href="/" class="text-slate-700 text-l font-bold underline mb-6">Back to login</a>
      {#if medical_profile && trials_initialised}
        <h3 class="text-2xl font-bold mb-6 mt-6">{eligibleStudies.length + ineligibleStudies.length} results for {medical_profile.condition} in {medical_profile.country}</h3>
      {/if}
  </section>
  <div class="mt-6">
    <Tabs>
      <TabItem open>
        <span slot="title" class="text-lg fond-bold">Potentially Eligible ({eligibleStudies.length})</span>
        {#if error}
        <p>{error}</p>
      {:else if data}
        <TrialSearchAITable data={eligibleStudies} {uuid} drugData={true} {condition} trialsearch_ai={trialsearch_ai} {prescreening_enabled} bind:ineligible_utns/>
      {/if}
    </TabItem>
    <TabItem>
      <span slot="title" class="text-lg fond-bold">Ineligible ({ineligibleStudies.length})</span>
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
