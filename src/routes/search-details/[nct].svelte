<script>
  export let nct;
  import DataTable from "../../components/DataTable.svelte";

const queryStr = `query {
  studies(where: {id: "${nct}"}) {
    id
    overall_status
    interventions
    title
  }
}`

  let data;
  let error;
  let isLoading = false;

  async function fetchData() {
    try {
      isLoading = true;
      const response = await fetch('https://enterprise-search.mytomorrows.com/gql/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: queryStr })
      });
      isLoading = false;

      const result = await response.json();

      if (result.errors) {
        error = result.errors[0].message;
      } else {
        data = result.data.aliases[0].aliasStudiedIn;
      }
    } catch (err) {
      isLoading = false;
      error = err.message;
    }
  }
</script>

<main>
<div class="p-8">
  <DataTable data={data} />
</div>
</main>