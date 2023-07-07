<script>
    import { Input, Label } from 'flowbite-svelte';
    import ApiButton from '../../components/ApiButton.svelte';
    import { PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    // Get token from url params
    let token = $page.url.searchParams.get('token');

    let NewPassword = null
    let RepeatPassword = null

    let sendingLink = false;

    function resetPasswordFunction() {
        sendingLink = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/reset_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                token: token,
                NewPassword: NewPassword,
                RepeatPassword: RepeatPassword
                })
        })
        .then(response => {
        if (response.status > 300) {
        // Load the response body as JSON, throw body.message as error
          return response.json().then(body => {
            return Promise.reject(new Error(body.message + body.details));
          });
        } else {
          return response;
        }
      })
        .then(response => response.json())
        .then(data => {
            alert("Password changed succesfully");
            window.location.href = '/';
        })
        .catch(error => {
            alert(error);
        });
    }

    onMount(() => {
        if (token == null) {
            window.location.href = '/';
        }
    })
</script>

<div class="m-6 mt-10">
    <a href="/" class="text-slate-700 text-md font-bold underline">Back to previous page</a>
    <section class="flex flex-col mt-8 mb-6 md:w-4/5 sm:w-full w-3/5">
        <h3 class="text-xl text-blue-500 text mb-4">Reset password</h3>
        <div>
            <Label class="mt-3 mb-2 text-l">New password</Label>
            <Input class="mb-4 bg-white" bind:value={NewPassword} placeholder="Enter your new password" type="password"></Input>
            <Label class="mt-3 mb-2 text-l">Confirm password</Label>
            <Input class="mb-4 bg-white" bind:value={RepeatPassword} placeholder="Repeat your new password" type="password"></Input>
            <ApiButton class="mt-4 mb-4" disabled={!NewPassword || !RepeatPassword || !(NewPassword === RepeatPassword) } text="Reset" onClick={() => resetPasswordFunction()} loading={sendingLink}></ApiButton>
        </div>
    </section>
</div>