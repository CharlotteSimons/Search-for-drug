<script>
  import LoginModal from "../components/LoginModal.svelte";
  import WaitlistRegisterSidebar from "../components/WaitlistRegisterSidebar.svelte";
  import { Accordion, AccordionItem, Button } from "flowbite-svelte";
  import { page } from '$app/stores';

  let loginModalOpen = false;
  let waitlist_hidden = true;

  const uuid = $page.url.searchParams.get('uuid');
</script>

<main>
  <div class="max-w-5xl mx-auto">
    <section class="mt-6 mb-6">
      <h1 class="text-4xl font-bold mb-6 text-blue-500">Welcome to myTomorrows TrialSearch AI for Healthcare Professionals</h1>
      <p class="text-gray-500 mb-6">Be the first to experience TrialSearch AI.</p>
    </section>
    <section class="mt-4 mb-4">
      <Button on:click={() => (loginModalOpen = true)}>Login</Button>
      <LoginModal bind:loginModalOpen={loginModalOpen} {uuid}/>
      <Button color="alternative" on:click={() => (waitlist_hidden = false)}>Register for waitlist</Button>
      <WaitlistRegisterSidebar bind:waitlist_hidden={waitlist_hidden} />
      <p class="text-gray-500 mb-6 py-6">* If you already have a myTomorrows for Healthcare Professionals account, you still need to register for the waitlist before you can login to access the beta version of TrialSearch AI</p>
    </section>
    <section class="mt-4 mb-4">
      <Accordion>
        <AccordionItem>
          <span slot="header" class="text-xl text-black">What is TrialSearch AI?</span>
          <p class="mb-2 text-gray-500 dark:text-gray-400">TrialSearch AI is a first of its kind, patient-focused pre-screening AI-supported search tool which allows Healthcare Providers (HCPs) to quickly find and review potentially eligible clinical trials for their patients.</p>
        </AccordionItem>
        <AccordionItem>
          <span slot="header" class="text-xl text-black">Why TrialSearch AI?</span>
          <p class="mb-2 text-gray-500 dark:text-gray-400">Typically, HCPs need to manually check and interpret the patient’s eligibility against each clinical trial available which can be an extremely time-consuming process. myTomorrows' TrialSearch AI makes the process of assessing a patient's eligibility easier and quicker.</p>
        </AccordionItem>
        <AccordionItem>
          <span slot="header" class="text-xl text-black">Why should you try the beta version of TrialSearch AI?</span>
          <p class="mb-2 text-gray-500 dark:text-gray-400">You will be one of the first to experience a tool using AI that helps provide quick insight for all possible clinical trials easier and quicker than doing the search manually. Try it out with test data or data relevant to your patient’s case.</p>
          <p>Have a say into TrialSearch AI by providing your feedback that will contribute to building a tool helping HCP’s and their patients.</p>
          <p>Be the first to know! myTomorrows will keep you updated with the progress of TrialSearch AI so you are the first to know about new launches.</p>
        </AccordionItem>
      </Accordion>
    </section>
  </div>
</main>
