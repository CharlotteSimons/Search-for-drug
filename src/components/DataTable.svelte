<script>
  import {
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Progressbar,
    Table,
    Skeleton,
    Alert,
    Popover,
    Button
  } from "flowbite-svelte";
  import { ArrowDownCircle, ArrowUpCircle } from "svelte-heros-v2";
  import { slide } from 'svelte/transition';
  import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';


  export let data = [];
  let columns = data.length > 0 ? Object.keys(data[0]) : [];

  export let uuid = "";

  function toSentenceCase(str) {
    let words = str.split("_");
    let sentenceCase = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    return sentenceCase;
  }

  export let disease = "";
  export let drugData = false;

  let query = null;
  let drugDataSources = [];
  let drugDataList = null;
  let loadingDrugData = false;
  let drugDataProgress = 0;

  async function getDrugData(title, intervention) {
      loadingDrugData = true;
      // Every second, increase the progress by 10%
      let interval = setInterval(() => {
        // Random value between 1 and 5
        let random = Math.floor(Math.random() * 5) + 1;
        drugDataProgress += random;
        if (drugDataProgress >= 100) {
          drugDataProgress = 100;
          clearInterval(interval);
        }
      }, 250);

      fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/drug_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            disease: disease,
            intervention: intervention
        })
      })
      .then(response => response.json())
      .then(data => {
        query = data.search_query;
        drugDataList = data.drug_data;
        drugDataSources = data.sources;
        loadingDrugData = false;
        clearInterval(interval);
        drugDataProgress = 0;
      })
      .catch((error) => {
        alert(error);
        loadingDrugData = false;
        clearInterval(interval);
        drugDataProgress = 0;
      })
    };

  let selectedRow = 0;

  function getDomainFromString(url) {
    let domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    return domain;
  }

  function rowClicked(row) {
    if (selectedRow === row) {
      selectedRow = null;
      drugDataProgress = 0;
      return;
    }
    selectedRow = row;
    getDrugData(
      row.title,
      row.interventions.join(', ')
    );
  }

  function cleanPhase(phase_str) {
    // If 'Phase' in str, only return the number after it
    if (phase_str.includes('Phase')) {
      return phase_str.replace('Phase', '').trim();
    } else {
      return phase_str;
    }
  }
</script>

<Table striped={true} divClass="relative w-full max-w-full" shadow>
  <TableHead theadClass="text-md bg-white">
    {#each columns as column, index}
      {#if column !== 'id' && column !== 'reports_as_closed'}
      <TableHeadCell>
        <div class="flex align-middle">
        {toSentenceCase(column)}
        {#if column === 'interventions'}
          <button id="b3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 ml-1"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>
          </button>
          <Popover triggeredBy="#b3" class="w-72 text-sm font-light text-gray-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400" placement="bottom-start">
            <div class="p-3 space-y-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">Latest clinical information</h3>
                <p>By clicking on the <ArrowDownCircle size="20" class="text-sky-900 inline"/> in the interventions column, we will gather the latest publications regarding efficacy and safety of the studied intervention in the selected disease. We then summarize the results using AI.</p>
              </div>
          </Popover>
        {/if}
        </div>
      </TableHeadCell>
      {/if}
    {/each}
  </TableHead>
  <TableBody class="divide-y">
    {#each data as row}

      <TableBodyRow>
        {#each columns as column, index}
        <!-- Drug  -->
          {#if column == 'interventions' && drugData}
          <TableBodyCell tdClass="px-6 py-4 font-medium" on:click={() => rowClicked(row)} id="intervention-cell">
            <div class="flex justify-between align-middle rounded-xl py-1 px-2 text-l font-medium bg-blue-50 hover:cursor-pointer">
              <span>{row[column].join(', ')}</span>
              <div class="block">
              {#if selectedRow === row}
                  <ArrowUpCircle size="24" class="text-sky-900"/>
                {:else}
                  <ArrowDownCircle size="24" class="text-sky-900"/>
                  {/if}
                </div>
            </div>
          </TableBodyCell>
        <!-- Status -->
          {:else if column == 'overall_status'}
            <TableBodyCell tdClass="px-6 py-4 font-medium">
              <div>
                {#if row[column] == 'Recruiting'}
                  <p class="font-bold text-blue-500">{row[column]}</p>
                {:else}
                  {row[column]}
                {/if}
                <!-- Reports as closed -->
                {#if row['reports_as_closed'] && row['reports_as_closed'] > 0}
                  <p class="text-xs text-red-800">{row['reports_as_closed']} reports as closed</p>
                {/if}
              </div>
          </TableBodyCell>
          <!-- Phase -->
          {:else if column == 'phase'}
          <TableBodyCell tdClass="px-6 font-medium">{cleanPhase(row[column])}</TableBodyCell>
          <!-- Title -->
          {:else if column == 'id'}
          {:else if column == 'reports_as_closed'}
          {:else if column == 'title'}
          <TableBodyCell tdClass="px-6 py-4 font-medium underline hover:cursor-pointer" on:click={window.location.href = `/llm/study-details?utn=${row['id']}&uuid=${uuid}`}>{row[column]}</TableBodyCell>
          <!-- URL -->
          {:else if (row[column] !== null && row[column].includes('http'))}
          <TableBodyCell tdClass="px-6 py-4 font-medium"><a class="underline hover:cursor-pointer text-blue-500" href={row[column]}>{getDomainFromString(row[column])}</a></TableBodyCell>
          {:else}
          <TableBodyCell tdClass="px-6 py-4 font-medium">{row[column]}</TableBodyCell>
          {/if}
        {/each}
      </TableBodyRow>
      <!-- Drug Data Row -->
      {#if selectedRow === row}
        <TableBodyRow>
            <TableBodyCell colspan={columns.length} tdClass="px-6 py-4 font-medium bg-gray-50 shadow-inner">
              <div transition:slide|local>
                <h3 class="text-xl font-bold mb-2 mt-2">Latest clinical information</h3>
                <div>
                {#if drugData && loadingDrugData}
                <div>
                  {#if drugDataProgress < 15}
                    <p class="text-sm text-gray-500 mb-2 animate-pulse" transition:slide>Searching for articles...</p>
                  {:else if drugDataProgress < 50}
                    <p class="text-sm text-gray-500 mb-2 animate-pulse" transition:slide>Reading articles...</p>
                  {:else if drugDataProgress < 85}
                    <p class="text-sm text-gray-500 mb-2 animate-pulse" transition:slide>Summarizing using AI... </p>
                  {:else if drugDataProgress < 100}
                    <p class="text-sm text-gray-500 mb-2 animate-pulse" transition:slide>Formatting into table... </p>
                  {:else if drugDataProgress == 100}
                    <p class="text-sm text-gray-500 mb-2 animate-pulse" in:slide>Finishing up...</p>
                  {/if}
                  <Progressbar progress={drugDataProgress}/>
                </div>
                  <div class="w-full bg-white p-4 rounded-lg mt-4">
                    <Skeleton/>
                  </div>
                {:else if drugData && drugDataList.length > 0}
                  <div>
                    <p class="mb-2 text-gray-500">Results for "<span class="italic">{query}</span>" using Bing Search</p>
                    <ul class="list-disc list-inside mb-3">
                        {#each drugDataSources as source}
                          <li class="mb-2">
                            <a class="underline hover:cursor-pointer text-blue-500" href={source.url}><span class="italic">{source.page_title}</span> - {getDomainFromString(source.url)}</a>
                          </li>
                        {/each}
                      </ul>
                  </div>  
                  <Alert color="blue">
                    <span slot="icon" class="text-sky-900"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.9914 2.86904C12.9914 2.86899 12.9914 2.86895 12.9914 2.86891C12.9256 2.37165 12.5016 2 12 2C11.4983 2 11.0743 2.37171 11.0086 2.86904L11.0086 2.86932L11.0085 2.86992L11.0075 2.87704L11.0029 2.91013C10.9985 2.94035 10.9917 2.98656 10.9822 3.04699C10.9633 3.16792 10.9339 3.34537 10.8927 3.56523C10.81 4.00611 10.6812 4.61161 10.4967 5.27082C10.1127 6.64363 9.5417 8.04408 8.79289 8.79289C8.04408 9.5417 6.64363 10.1127 5.27082 10.4967C4.61161 10.6812 4.00611 10.81 3.56523 10.8927C3.34537 10.9339 3.16792 10.9633 3.04699 10.9822C2.98656 10.9917 2.94035 10.9985 2.91013 11.0029L2.87704 11.0075L2.86992 11.0085L2.86932 11.0086C2.86923 11.0086 2.86913 11.0086 2.86904 11.0086C2.86899 11.0086 2.86895 11.0086 2.86891 11.0086C2.37165 11.0744 2 11.4984 2 12C2 12.5017 2.37171 12.9257 2.86904 12.9914L2.86932 12.9914L2.86992 12.9915L2.87704 12.9925L2.91013 12.9971C2.94035 13.0015 2.98656 13.0083 3.04699 13.0178C3.16792 13.0367 3.34537 13.0661 3.56523 13.1073C4.00611 13.19 4.61161 13.3188 5.27082 13.5033C6.64363 13.8873 8.04408 14.4583 8.79289 15.2071C9.5417 15.9559 10.1127 17.3564 10.4967 18.7292C10.6812 19.3884 10.81 19.9939 10.8927 20.4348C10.9339 20.6546 10.9633 20.8321 10.9822 20.953C10.9917 21.0134 10.9985 21.0596 11.0029 21.0899L11.0075 21.123L11.0085 21.1301L11.0086 21.1307C11.0086 21.1308 11.0086 21.1309 11.0086 21.131C11.0086 21.131 11.0086 21.131 11.0086 21.131C11.0743 21.6283 11.4983 22 12 22C12.5017 22 12.9257 21.6283 12.9914 21.131L12.9914 21.1307L12.9915 21.1301L12.9925 21.123L12.9971 21.0899C13.0015 21.0596 13.0083 21.0134 13.0178 20.953C13.0367 20.8321 13.0661 20.6546 13.1073 20.4348C13.19 19.9939 13.3188 19.3884 13.5033 18.7292C13.8873 17.3564 14.4583 15.9559 15.2071 15.2071C15.9559 14.4583 17.3564 13.8873 18.7292 13.5033C19.3884 13.3188 19.9939 13.19 20.4348 13.1073C20.6546 13.0661 20.8321 13.0367 20.953 13.0178C21.0134 13.0083 21.0596 13.0015 21.0899 12.9971L21.123 12.9925L21.1301 12.9915L21.1307 12.9914C21.1308 12.9914 21.1309 12.9914 21.131 12.9914C21.131 12.9914 21.131 12.9914 21.131 12.9914C21.6283 12.9257 22 12.5017 22 12C22 11.4983 21.6283 11.0743 21.131 11.0086L21.1307 11.0086L21.1301 11.0085L21.123 11.0075L21.0899 11.0029C21.0596 10.9985 21.0134 10.9917 20.953 10.9822C20.8321 10.9633 20.6546 10.9339 20.4348 10.8927C19.9939 10.81 19.3884 10.6812 18.7292 10.4967C17.3564 10.1127 15.9559 9.5417 15.2071 8.79289C14.4583 8.04408 13.8873 6.64363 13.5033 5.27082C13.3188 4.61161 13.19 4.00611 13.1073 3.56523C13.0661 3.34537 13.0367 3.16792 13.0178 3.04699C13.0083 2.98656 13.0015 2.94035 12.9971 2.91013L12.9925 2.87704L12.9915 2.86992L12.9914 2.86932C12.9914 2.86923 12.9914 2.86913 12.9914 2.86904ZM16.8722 12C15.7644 11.5928 14.6021 11.0163 13.7929 10.2071C12.9837 9.39792 12.4072 8.23564 12 7.12776C11.5928 8.23564 11.0163 9.39792 10.2071 10.2071C9.39792 11.0163 8.23564 11.5928 7.12776 12C8.23564 12.4072 9.39792 12.9837 10.2071 13.7929C11.0163 14.6021 11.5928 15.7644 12 16.8722C12.4072 15.7644 12.9837 14.6021 13.7929 13.7929C14.6021 12.9837 15.7644 12.4072 16.8722 12Z"></path></svg>
                    </span>
                    <span class="text-sky-900">Experimental! <span class="font-light">Summary table generated using AI.</span></span>
                  </Alert>
                  <div class="mt-4">
                  <svelte:self data={drugDataList}/>
                  </div>
                {/if}
              </div>
          </TableBodyCell>
      </TableBodyRow>
      {/if}
      {/each}
    </TableBody>
</Table>