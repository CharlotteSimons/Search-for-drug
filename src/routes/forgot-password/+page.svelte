<script>
    import { Input, Label, Toast } from 'flowbite-svelte';
    import ApiButton from '../../components/ApiButton.svelte';

    let email = null;
    let sendingLink = false;
    let emailSent = false;

    function forgotPasswordFunction() {
        sendingLink = true;
        fetch(' https://microservice-develop.mytomorrows.com/v1.2.0/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                Email1: email,
                Portal: 'llm',
                url: "https://mytomorrows.com/llm/en/reset-password?token="
                })
        })
        .then(response => response.json())
        .then(data => {
            sendingLink = false;
            email = null;
            emailSent = true;
        })
    }
</script>

<div class="m-6 mt-10">
    <a href="/" class="text-slate-700 text-md font-bold underline">Back to previous page</a>
    <section class="flex flex-col mt-8 mb-6 md:w-4/5 sm:w-full w-3/5">
        <h3 class="text-xl text-blue-500 text mb-4">Forgot password?</h3>
        <p>E-mail yourself a link to reset your password</p>
        <div>
            <Label class="mt-3 mb-2 text-l">Email</Label>
            <Input class="mb-4 bg-white" bind:value={email} placeholder="Provide your email address" type="email"></Input>
            <ApiButton class="mt-4 mb-4" disabled={!email} text="Send link" onClick={() => forgotPasswordFunction()} loading={sendingLink}></ApiButton>
        </div>
        <Toast bind:open={emailSent} class="mt-4 mb-4">E-mail sent succesfully.</Toast>
    </section>
</div>