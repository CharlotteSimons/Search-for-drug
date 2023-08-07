<script>
  import MdtLoginModal from "../../components/MDT/MDTLoginModal.svelte";
  import WaitlistRegisterSidebar from "../../components/WaitlistRegisterSidebar.svelte";
  import { Accordion, AccordionItem, Button } from "flowbite-svelte";

  let loginModalOpen = false;
  let waitlist_hidden = true;

</script>

<main>
  <div class="max-w-5xl mx-auto">
    <section class="mt-6 mb-6">
      <h1 class="text-4xl font-bold mb-6 text-blue-500">Welcome to myTomorrows TrialSearch AI for MDTs</h1>
    </section>
    <section class="mt-4 mb-4">
      <Button on:click={() => (loginModalOpen = true)}>Login</Button>
      <MdtLoginModal bind:loginModalOpen={loginModalOpen}/>
      <Button color="alternative" on:click={() => (waitlist_hidden = false)}>Register for waitlist</Button>
      <WaitlistRegisterSidebar bind:waitlist_hidden={waitlist_hidden} />
      <p class="text-gray-500 mb-6 py-6">*If you already have a myTomorrows for Healthcare Professionals account, you still need to register for the waitlist before you can login to access the beta version of TrialSearch AI</p>
    </section>
  </div>
</main>
