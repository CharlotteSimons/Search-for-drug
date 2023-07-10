<script>
  import { Button, Modal, Label, Input, Checkbox } from 'flowbite-svelte'
  import ApiButton from './ApiButton.svelte';
  export let loginModalOpen = false;
  import { PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';


    let email = null;
    let password = null;
    let error;

    let loading = false;
    function loginFunction() {
        // Remove the current token
        sessionStorage.removeItem('hcp.user.session.token');

        loading = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                Email: email,
                Password: password,
                Portal: 'llm'
                })
        })
        // Check if status_code > 300
        .then(response => {
            if (response.status >= 300) {
              // Load the response body as JSON, throw body.message as error
              return response.json().then(body => {
                return Promise.reject(new Error(body.message));
              });
            } else {
              return response;
            }
        })
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem('hcp.user.session.token', data.details.token),
            loading = false,
            window.location.href = '/llm';
        })
        .catch(err => {
            error = err
            alert(error)
            loading = false;
        });
    }
</script>

<Modal bind:open={loginModalOpen} size="xs" autoclose={false} class="w-full">
  <form class="flex flex-col space-y-6" action="#">
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" name="email" placeholder="name@company.com" bind:value={email} required />
    </Label>
    <Label class="space-y-2">
      <span>Your password</span>
      <Input type="password" name="password" placeholder="•••••" bind:value={password} required />
    </Label>
    <ApiButton onClick={() => loginFunction()} text={"Login to your account"} loading={loading} class="w-full1" />
    <div class="flex items-stretch text-sm font-medium text-gray-500 dark:text-gray-300">
        <!-- <span>Not registered? <a href="/" class="text-blue-700 hover:underline dark:text-blue-500">Sign up</a></span> -->
        <a on:click={() => window.location.href = '/forgot-password'} class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Forgot password?</a>
      </div>
  </form>
</Modal>