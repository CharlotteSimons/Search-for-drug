<script>
    import { onMount } from "svelte";
    import { Skeleton } from "flowbite-svelte";
    import { page } from '$app/stores';
    import { PUBLIC_SEARCH_API_BASE } from '$env/static/public';


    // This page is just for redirecting to the correct subpage
    // based on the status in the payload
    const uuid = $page.url.searchParams.get('uuid');

    async function redirectLLM() {
        fetch(PUBLIC_SEARCH_API_BASE + '/v01/llm/request_tsr',
            {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
            uuid: uuid,
            token: sessionStorage['hcp.user.session.token']
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status == 'review') {
                // Redirect to /llm/review
                window.location.href = '/llm/review?uuid=' + uuid;
            } else if (data.status == 'completed') {
                // Redirect to /llm/complete
                window.location.href = '/llm/results?uuid=' + uuid;
            } else if (data.status == 'pending') {
                // Redirect to /llm/pending
                window.location.href = '/llm/review?uuid=' + uuid;
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(error);
        });
    }

    onMount(() => {
        if (!uuid) {
            window.location.href = '/llm';
        }
        redirectLLM();
    });
</script>

<!-- Center on page -->
<div class="p-8">
    <h1 class="text-2xl font-bold mb-8">Redirecting...</h1>
    <Skeleton />
</div>