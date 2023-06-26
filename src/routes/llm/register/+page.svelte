<script>
    import { Input, Checkbox, Label, Toast, Select } from 'flowbite-svelte';
    import ApiButton from '../../../components/ApiButton.svelte';
    import {onMount } from 'svelte';
    import { PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';

    let email = null;

    let show = false;
    let current_state = 1;

    let counter = 15;
    let toast_color = 'red';
    let toast_message = 'Something went wrong!';

    function trigger() {
        show = true;
        counter = 15;
        timeout();
    }

    function timeout() {
        if (--counter > 0)
        return setTimeout(timeout, 1000);
        show = false;
    }

    let creatingCode = false;
    let code = null;
    async function createCode() {
        creatingCode = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/authentication/create_code/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Email: email,
                Portal: 'llm'
            })
        })
        .then(response => response.json())
        .then(data => {
            creatingCode = false;
            if (data.status === 'Succes') {
                current_state = 2;
            } else {
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        })
        .catch(error => {
            creatingCode = false;
            toast_color = 'red';
            toast_message = error;
            trigger();
        })
        ;
    }

    async function checkCode() {
        creatingCode = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/authentication/check_code', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Email": email,
                "Portal": 'llm',
                "2fa": "false",
                "Code": code,
                "getContactEnabled": "",
                "token": ""
            })
        })
        .then(response => response.json())
        .then(data => {
            creatingCode = false;
            if (data.status === 'Succes') {
                sessionStorage.setItem('hcp.user.session.token', data.details.token)
                current_state = 3;
            } else {
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        })
        .catch(error => {
            creatingCode = false;
            toast_color = 'red';
            toast_message = error;
            trigger();
        })
        ;
    }

    let password1 = null;
    let password2 = null;
    let creatingPassword = false;
    async function createPassword() {
        creatingPassword = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/reset_password', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                NewPassword: password1,
                RepeatPassword: password2,
                token: sessionStorage['hcp.user.session.token']
            })
        })
        .then(response => response.json())
        .then(data => {
            creatingPassword = false;
            if (data.status === 'Succes') {
                current_state = 4;
            } else {
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        })
        .catch(error => {
            creatingPassword = false;
            toast_color = 'red';
            toast_message = error;
            trigger();
        })
        ;
    }

    let title = null;
    let first_name = null;
    let last_name = null;
    let phone = null;
    let healthcare_profession = null;
    let country = null;
    let registration_number = null;
    let specialty = null;
    let updatingUser = false;
    async function updateUser() {
        updatingUser = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/update_user', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Country": country,
                "FirstName": first_name,
                "LastName": last_name,
                "TitlePrefix": title,
                "Phone": phone,
                "JobTitle": healthcare_profession,
                "MedicalLicenseNumber": registration_number,
                "Speciality": specialty,
                "token": sessionStorage['hcp.user.session.token']
            })
        })
        .then(response => response.json())
        .then(data => {
            updatingUser = false;
            if (data.status === 'Succes') {
                current_state = 5;
            } else {
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        })
        .catch(error => {
            updatingUser = false;
            toast_color = 'red';
            toast_message = error;
            trigger();
        })
        ;
    }

    let llm_consent = false;
    let llm_contact_consent = false;
    let updatingConsent = false;

    async function updateConsent() {
        updatingConsent = true;
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/update_user', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "LLMConsent": llm_consent,
                "LLMContactConsent": llm_contact_consent,
                "Portal": "llm",
                "token": sessionStorage['hcp.user.session.token']
            })
        })
        .then(response => response.json())
        .then(data => {
            updatingConsent = false;
            if (data.status === 'Succes') {
                window.location.href = '/';
            } else {
                toast_color = 'red';
                toast_message = data.message;
                trigger();
            }
        })
        .catch(error => {
            updatingConsent = false;
            toast_color = 'red';
            toast_message = error;
            trigger();
        })
        ;
    }


    let speciality_options = [];
    let country_options = [];
    async function getLookup(lookup_type) {
        fetch(PUBLIC_MICROSERVICE_API_BASE + '/v1.2.0/api/get_lookup', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            Entity: [
                lookup_type
            ],
            lookup_dict: true
        })
        })
        .then(response => response.json())
        // Data format = results.details.{
            // country: {
                // id_country: int
            // }
            // country2: ...
        // }
        .then(data => {
            let local_lookup = [];
            for (const [key, value] of Object.entries(data.details)) {
                local_lookup.push({
                    value: key,
                    name: key
                });
            }
            // sort
            local_lookup.sort((a, b) => (a.name > b.name) ? 1 : -1);
            if (lookup_type == 'Country') {
                country_options = local_lookup;
            } else {
                speciality_options = local_lookup;
            }
            
        })
        .catch(error => {
            toast_color = 'red';
            toast_message = error;
            trigger();
        })
    }

    onMount(async () => {
        getLookup('Specialization');
        getLookup('Country');
    });

</script>

<div class="m-6 mt-10">
    <a href="/" class="text-slate-700 text-l font-bold underline">Back to login</a>
    <section class="flex flex-col mt-8 mb-6 md:w-4/5 sm:w-full w-3/5">
        {#if current_state === 1}
        <h3 class="text-xl text-blue-500 text mb-4">Provide your email address for portal communication and to login to your account</h3>
        <div>
        <Label class="mt-3 mb-2 text-l">Email address *</Label>
        <Input class="mb-4 bg-white" bind:value={email} placeholder="Provide your email address" type="email"></Input>
        <Toast color={toast_color} bind:open={show} class="mt-4 mb-4">{toast_message}</Toast>
        <ApiButton class="mt-4 mb-4" disabled={!email} text="Next" onClick={() => createCode()} loading={creatingCode}></ApiButton>
        </div>
        {:else if current_state === 2}
        <h3 class="text-xl text-blue-500 text mb-4">As you have had contact with myTomorrows, we have prepared an account for you using this email and other acquired information.</h3>
        <p>We have sent a verification code to your inbox to confirm it is you before we continue. Please enter the code below. It is valid for 20 minutes.</p>
        <div>
        <Label class="mt-3 mb-2 text-l">Verification code *</Label>
        <Input class="mb-4 bg-white" placeholder="Enter your verification code" bind:value={code}></Input>
        <Toast color={toast_color} bind:open={show} class="mt-4 mb-4">{toast_message}</Toast>
        <ApiButton class="mt-4 mb-4" text="Next" onClick={() => checkCode()}></ApiButton>
        </div>
        {:else if current_state === 3}
        <h3 class="text-xl text-blue-500 text mb-4">Account password</h3>
        <p>Please create your new password.</p>
        <div>
        <Label class="mt-3 mb-2 text-l">Password *</Label>
        <Input class="mb-4 bg-white" placeholder="Enter your password" bind:value={password1} type="password"></Input>
        <Label class="mt-3 mb-2 text-l">Confirm password *</Label>
        <Input class="mb-4 bg-white" placeholder="Confirm your password" bind:value={password2} type="password"></Input>
        <Toast color={toast_color} bind:open={show} class="mt-4 mb-4">{toast_message}</Toast>
        <ApiButton class="mt-4 mb-4" text="Next" onClick={() => createPassword()} loading={creatingPassword} disabled={!password1 || !password2}></ApiButton>
        </div>
        {:else if current_state === 4}
        <h3 class="text-xl text-blue-500 text mb-4">Profile</h3>
        <p>Please enter your details</p>
        <div>
            <!-- 2 cols for large screens, 1 for small -->
            <div class="grid grid-cols-1 sm:grid-cols-auto md:grid-cols-2 gap-6">
                <div>
                <!-- Title, First name, Last name, Phone -->
                <Label class="mt-3 mb-2 text-l">Title *</Label>
                <Input class="mb-4 bg-white" placeholder="Enter your title" bind:value={title}></Input>
                <Label class="mt-3 mb-2 text-l">First name *</Label>
                <Input class="mb-4 bg-white" placeholder="Enter your first name" bind:value={first_name}></Input>
                <Label class="mt-3 mb-2 text-l">Last name *</Label>
                <Input class="mb-4 bg-white" placeholder="Enter your last name" bind:value={last_name}></Input>
                <Label class="mt-3 mb-2 text-l">Phone *</Label>
                <Input class="mb-4 bg-white" placeholder="Enter your phone number" bind:value={phone}></Input>
                </div>
                <!-- Country of practice, registration number, healthcare profession, specialty/area of interest -->
                <div>
                <Label class="mt-3 mb-2 text-l">Country of Practice *</Label>
                <Select class="mb-4 bg-white" placeholder="Enter your country of practice" bind:value={country} items={country_options}></Select>
                <Label class="mt-3 mb-2 text-l">Professional Registration Number</Label>
                <Input class="mb-4 bg-white" placeholder="Enter your registration number" bind:value={registration_number}></Input>
                <Label class="mt-3 mb-2 text-l">Healthcare Profession *</Label>
                <Select class="mb-4 bg-white" placeholder="Enter your healthcare profession" bind:value={healthcare_profession} items={speciality_options}></Select>
                <Label class="mt-3 mb-2 text-l">Specialty/Area of interest</Label>
                <Input class="mb-4 bg-white" placeholder="Enter your specialty/area of interest" bind:value={specialty}></Input>
                </div>
            </div>
            <Toast color={toast_color} bind:open={show} class="mt-4 mb-4">{toast_message}</Toast>
            <ApiButton class="mt-4 mb-4" text="Next" onClick={() => updateUser()} loading={updatingUser} disabled={!title || !first_name || !last_name || !phone || !country || !healthcare_profession}></ApiButton>
        </div>
        {:else if current_state === 5}
        <h3 class="text-xl text-blue-500 text mb-4">Consent Statements</h3>
        <p>Please read and accept the consents.</p>
        <div class="mt-4 mb-4">            
            <Checkbox checked={llm_consent} on:click={() => {llm_consent = !llm_consent}} class="mt-3 mb-2 text-l">
<span>I acknowledge and accept that myTomorrows uses Artificial Intelligence to help find pre-approval options from clinicaltrials.gov and the EU Clinical Trials register for available Clinical Trials and Expanded Access Programs. I understand that the options are for informational purposes only and that as a medical professional I am responsible for deciding whether each trial is safe and appropriate for the patient(s) under my care. I understand that my use of my search is subject to terms and conditions and by clicking this box I state that I have read understood and agree the<a href="https://agreements-documents.mytomorrows.com/2023.04.11-Terms-of-Use-myTomorrows.pdf" target="_blank" class="text-blue-500 ml-1"> Terms of Use.*</a></span></Checkbox>
            <Checkbox checked={llm_contact_consent} on:click={() => llm_contact_consent = !llm_contact_consent} class="mt-3 mb-6 text-l">I agree and consent to myTomorrows reaching out to me via e-mail or by phone to gather my feedback on my use of TrialSearch AI.</Checkbox>
            <ApiButton text="Finish account setup" onClick={() => updateConsent()} loading={updatingConsent} disabled={!llm_consent}></ApiButton>
        </div>
        {/if}
    </section>
</div>