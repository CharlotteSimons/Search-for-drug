<script>
  import DataTable from '../../../components/DataTable.svelte';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let eligible = null;
  let ineligible = null;

  $: eligibleStudies = data ? data.filter(study => eligible.includes(study.id)) : [];
  $: ineligibleStudies = data ? data.filter(study => ineligible.includes(study.id)) : [];

  let isLoading = true;

  let token = null
  let data;
  let error;

  async function fetchData() {
    try {
      if (!eligible || !ineligible) {
        await loadResults();
      }
      let all_ids = eligible.concat(ineligible)
      all_ids = all_ids.join('","')
      let queryStr = `query {
      studies(where: {id_IN: ["${all_ids}"]}, options: {sort: {phase: DESC}}) {
          title
          phase
          interventions
          id
        }
      }`
      isLoading = true;
      const response = await fetch('https://enterprise-search-develop.mytomorrows.com/gql/graphql', {
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
        isLoading = false;
        data = result.data.studies;
      }
    } catch (err) {
      error = err.message;
    }
  }

  // Load the data from the API, don't use interval
  let disease = null;
  const uuid = $page.url.searchParams.get('uuid'); 
  async function loadResults() {
    if (eligible === null) {
      fetch('https://enterprise-search-develop.mytomorrows.com/v01/llm/request_tsr', 
                {
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
        // Concat arrays
          eligible = data.tsr.eligibility.potentially_eligible;
          eligible = eligible.concat(data.tsr.eligibility.unable_to_screen);
          ineligible = data.tsr.eligibility.ineligible;
          disease = data.tsr.medical_profile.condition;
          fetchData();
      });
      }
  };

  // hcp.user.session.token check if the user is logged in
  onMount(() => {
    if (sessionStorage['hcp.user.session.token'] == null) {
      console.log('User is not logged in')
      window.location.href = '/';
    } else {
      token = sessionStorage['hcp.user.session.token'];
      loadResults();
    }
  })
</script>

<main>
<div class="p-8 w-full">
  <a href="/" class="text-slate-700 text-l font-bold underline mb-6">Back to login</a>
  <div class="mt-6">
  <Tabs>
    <TabItem open>
      <span slot="title" class="text-lg">Potentially Eligible ({eligibleStudies.length})</span>
      {#if error}
        <p>{error}</p>
      {:else if data}
        <DataTable data={eligibleStudies} {uuid} drugData={true} {disease}/>
      {/if}
    </TabItem>
    <TabItem>
      <span slot="title" class="text-lg">Ineligible ({ineligibleStudies.length})</span>
      {#if error}
        <p>{error}</p>
      {:else if data}
        <DataTable data={ineligibleStudies} {uuid} drugData={true} {disease}/>
      {/if}
    </TabItem>
  </Tabs>
  </div>
</div>
</main>
