<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Skeleton, Button } from 'flowbite-svelte';
  import LlmCriteria from '../../../components/LLMCriteria.svelte';
  import EnrollmentSupportSidebar from '../../../components/EnrollmentSupportSidebar.svelte';
  import DataTable from '../../../components/DataTable.svelte';
  import ReportAsClosedModal from '../../../components/ReportAsClosedModal.svelte';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';

  let hidden1 = true; 
  let ReportModalOpen = false;

  const uuid = $page.url.searchParams.get('uuid');
  const utn = $page.url.searchParams.get('utn');

  let isLoading = true;
  let data;
  let error;

  async function fetchData() {
    try {
      let queryStr = `query {
      studies(where: {id: "${utn}"}) {
          id
          overall_status
          reports_as_closed
          interventions
          title
          study_type
          phase
          primary_purpose
          protocol_type
          conditions
          start_date
          end_date
          detailed_description
          locatedAt {
            sitename
            countryname
            city
          }
          additional_info
          references
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
            data = result.data.studies[0];
            data.conditions = parseJsonList(data.conditions);
            isLoading = false;
      }
    } catch (err) {
      error = err.message;
    }
  }
    
    // json load a string, then parse it
    function parseJsonList(json) {
        if (json == null) {
            return null;
        } else if (json == '') {
            return null;
        }
        return JSON.parse(json).join(', ');
    }   
   
    // Load the data from the API
    onMount(() => {
    if (sessionStorage['hcp.user.session.token'] == null) {
      console.log('User is not logged in')
      window.location.href = '/';
    } else {
        fetchData();
    }
    });

</script>
<main class="max-w-1280">
    <section class="w-full p-6 mt-6 bg-white">
        {#if isLoading}
            <Skeleton class="mb-4"/>
        {:else}
        <div class="flex w-full">
            <h1 class="text-3xl font-bold text-blue-600">{data.title}</h1>
        </div>
        {/if}
    </section>

    {#if !isLoading && data.reports_as_closed && data.reports_as_closed > 0}
    <div class="bg-red-800 w-full px-4 py-1 text-white">
        <p>{data.protocol_type} was reported as closed by {data.reports_as_closed} myTomorrows user(s)</p>
    </div>
    {/if}

    <section class="w-full p-6 mb-6 mt-6 bg-white">
        <h2 class="text-2xl font-bold mb-4 text-blue-600">Study Details</h2>
        {#if isLoading}
            <Skeleton class="mb-4"/>
        {:else}
        <div class="flex w-full">
            <div class="flex w-1/2" id="col1">
                <div class="w-1/3">
                    <div class="mb-2"><strong>Study Type</strong></div>
                    <div class="mb-2"><strong>Overall Status</strong></div>
                    <div class="mb-2"><strong>Interventions</strong></div>
                    <div class="mb-2"><strong>Phase</strong></div>
                </div>
                <div class="w-2/3">
                    <div class="mb-2">{data.study_type}</div>
                    <div class="mb-2">{data.overall_status} <span class="text-red-800 cursor-pointer" on:click={() => (ReportModalOpen = true)}>Incorrect?</span></div>
                    <div class="mb-2">{data.interventions.join(', ')}</div>
                    <div class="mb-2">{data.phase}</div>
                    <ReportAsClosedModal utn={utn} bind:ReportModalOpen={ReportModalOpen} />
                </div>
            </div>
            <div class="flex w-1/2" id="col2">
                <div class="w-1/3">
                    <div class="mb-2"><strong>Primary Purpose</strong></div>
                    <div class="mb-2"><strong>Conditions</strong></div>
                    <div class="mb-2"><strong>Start Date</strong></div>
                    <div class="mb-2"><strong>End Date</strong></div>
                </div>
                <div class="w-2/3">
                    <div class="mb-2">{data.primary_purpose}</div>
                    <div class="mb-2">{data.conditions}</div>
                    <div class="mb-2">{data.start_date}</div>
                    <div class="mb-2">{data.end_date}</div>
                </div>
            </div>
        </div>
        {/if}
    </section>
    <section class="w-full p-6 mb-6 border-blue-600 border-2 rounded-lg">
        <!-- Center all items in div -->
        <div class="flex items-center flex-col justify-center">
            <h3 class="text-xl font-bold mb-4">Request Access</h3>
            <p class="text-md text-center mb-2">Here are the next steps to access the trial you selected:</p>
            <p class="text-md text-center mb-2">The myTomorrows team will be notified of your request to access the selected trial and will provide you with next steps of the enrolment request.</p>
            <p class="text-md text-center mb-2">The information you have provided will be visible to the myTomorrows team for reviewing.</p>
            <p class="text-md text-center mb-2">In the meantime, if you have any questions, please reach out to: beta@mytomorrows.com</p>
            <Button class="mt-4" on:click={() => (hidden1 = false)}>Request Access</Button>
        </div>
    </section>
    <section class="w-full p-6 mb-6 bg-white">
        <h2 class="text-2xl font-bold mb-4 text-blue-600">Description</h2>
        {#if isLoading}
            <Skeleton class="mb-4"/>
        {:else}
        <div class="flex w-full">
            <p>{data.detailed_description}</p>
        </div>
        {/if}
    </section>
    <section class="w-full p-6 mb-6 bg-white">
        {#if isLoading}
            <Skeleton class="mb-4"/>
        {:else}
        <div class="flex w-full">
            <LlmCriteria {uuid} {utn}/>
        </div>
        {/if}
    </section>
    <section class="w-full p-6 mb-6 border-blue-600 border-2 rounded-lg">
        <!-- Center all items in div -->
        <div class="flex items-center flex-col justify-center">
            <h3 class="text-xl font-bold mb-4">Request Access</h3>
            <p class="text-md text-center mb-2">Here are the next steps to access the trial you selected:</p>
            <p class="text-md text-center mb-2">The myTomorrows team will be notified of your request to access the selected trial and will provide you with next steps of the enrolment request.</p>
            <p class="text-md text-center mb-2">The information you have provided will be visible to the myTomorrows team for reviewing.</p>
            <p class="text-md text-center mb-2">In the meantime, if you have any questions, please reach out to: beta@mytomorrows.com</p>
            <Button class="mt-4" on:click={() => (hidden1 = false)}>Request Access</Button>
        </div>
    </section>
    <section class="w-full p-6 mb-6 bg-white">
        <h2 class="text-2xl font-bold mb-4 text-blue-600">Trial Locations</h2>
        {#if isLoading}
            <Skeleton class="mb-4"/>
        {:else}
        <div class="flex w-full">
            <DataTable data={data.locatedAt}/>
        </div>
        {/if}
    </section>
    <section class="w-full p-6 bg-white mb-6">
        <h2 class="text-2xl font-bold mb-4 text-blue-600">Additional Information</h2>
        {#if isLoading}
            <Skeleton class="mb-4"/>
        {:else}
        <div class="flex w-full">
            <div class="flex w-1/2" id="col1">
                <div class="w-1/3">
                    <div class="mb-2"><strong>Sponsor</strong></div>
                </div>
                <div class="w-2/3">
                    <div class="mb-2">{JSON.parse(data.additional_info).sponsors[0].name}</div>
                </div>
            </div>
        </div>
        <h3 class="text-xl font-bold mb-4 mt-4 text-blue-600">Sources</h3>
        <div class="flex w-full">
            {#each JSON.parse(data.references) as reference}
            <div class="flex w-1/2" id="col1">
                <div class="w-1/3">
                    <div class="mb-2"><strong>{reference.source}</strong></div>
                </div>
                <div class="w-2/3">
                    <div class="mb-2">
                        <a href="{reference.url}" target="_blank" class="text-blue-500 underline">{reference.identifier}</a>
                    </div>
                </div>
            </div>
            {/each}
        </div>
        {/if}
    </section>

    <EnrollmentSupportSidebar bind:hidden1={hidden1} {utn}/>
</main>