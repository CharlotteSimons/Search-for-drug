<script>
  import "../app.postcss";
  import { Navbar, NavBrand } from 'flowbite-svelte'
  import { Footer, FooterCopyright, FooterLink, FooterLinkGroup, Badge } from "flowbite-svelte"
  export const prerender = true;

</script>

<Navbar let:hidden let:toggle class="bg-[#FAFAFA] drop-shadow-md">
  <NavBrand href="/">
    <img
      src="https://cdn-wagtail-llm-release.mytomorrows.com/media/images/v2_BothLogos.original.png"
      class="mr-3 h-4 sm:h-9"
      alt="Flowbite Logo"
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