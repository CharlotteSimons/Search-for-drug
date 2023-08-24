<script>
  import "../app.postcss";
  import { Navbar, NavBrand } from 'flowbite-svelte'
  import { Footer, FooterCopyright, FooterLink, FooterLinkGroup, Badge } from "flowbite-svelte"
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { PUBLIC_MICROSERVICE_API_BASE } from '$env/static/public';
  export const prerender = true;

  async function getUser() {
    // Exceptions to the login requirement
    const whitelist = ['/', '/mdt/', '/llm/register/', '/forgot-password/', '/waitlist/']
    if (whitelist.includes($page.url.pathname)) {
      return;
    }
    
    if (localStorage.getItem('hcp.user.session.token') == null) {
      alert("You are not logged in.")
      window.location.href = '/';
    }

    fetch(PUBLIC_MICROSERVICE_API_BASE + "/v1.2.0/api/get_user", {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            token: localStorage['hcp.user.session.token']
        })
    })
    // Check if status_code > 300
    .then(response => {
    if (response.status > 300) {
        // Load the response body as JSON, throw body.message as error
          return response.json().then(body => {
            return Promise.reject(new Error(body.message));
          });
      } else {
        return response;
      }
    })  
    .then(response => response.json())
    .catch(error => {
      // Delete the token and redirect to login
      alert(error);
      localStorage.removeItem('hcp.user.session.token');

      // Redirect to login; keep any uuid parameters
      const uuid = $page.url.searchParams.get('uuid');
      if (uuid) {
        window.location.href = `/?uuid=${uuid}`;
      } else {
        window.location.href = '/';
      }
    });
  }

  onMount(getUser());
</script>

<Navbar let:hidden let:toggle class="bg-[#FAFAFA] drop-shadow-sm">
  <NavBrand href="/">
    <img
      src="https://cdn-wagtail-llm-release.mytomorrows.com/media/images/v2_BothLogos.original.png"
      class="mr-3 h-4 sm:h-9"
      alt="myTomorrows and TrialSearch AI Logo"
    />
    <Badge>Beta</Badge>
  </NavBrand>
</Navbar>
<div class="container mx-auto px-4 min-h-screen">
  <slot />
</div>
<Footer class="bg-blue-500 mt-auto">
  <FooterCopyright href="/" by="myTomorrows" year={2023}/>
  <FooterLinkGroup ulClass="flex flex-wrap items-center mt-3 text-sm dark:white sm:mt-0">
    <FooterLink href="https://mytomorrows.com">About</FooterLink>
    <FooterLink href="https://mytomorrows.com/en/privacy-statement">Privacy Policy</FooterLink>
    <FooterLink href="https://mytomorrows.com/en/cookie-statement">Cookies statement</FooterLink>
    <FooterLink href="https://agreements-documents.mytomorrows.com/terms-of-use-mytomorrows.pdf">Terms of Use</FooterLink>
  </FooterLinkGroup>
</Footer>