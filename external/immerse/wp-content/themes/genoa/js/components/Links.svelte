<script>
  import {themeBase} from "@components/common";

  export let links;
  export let title;

  function getLinkTitle(link) {
    if(link.title) return link.title;
    if(!link.url) return '';

    try {
      const url = new URL(link.url);
      return url.hostname;
    }
    catch(e) {
      return url.url;
    }
  }
</script>

{#if links && links.length}
  {#if title}
    <h2 class="links__title">{title}</h2>
  {/if}

  <nav class="links {$$props.class}" class:is-with-title={title}>
    {#each links as link}
      <a class="link" target="_blank" href="{ link.url }">
        <span class="link__title">{ getLinkTitle(link) }</span>
        <img class="link__icon" src="{themeBase}/images/link.svg" alt="(External link)">
      </a>
    {/each}
  </nav>
{/if}