<script>
  import { fade } from 'svelte/transition';
  import { themeBase, t } from "@components/common";
  import CloseIcon from "@components/CloseIcon.svelte";
  import {onMount} from "svelte";

  let open = false;
  let textElement;
  let button;
  export let text = '';

  function onKeyUp(e) {
    if(e.key.toLowerCase() === 'escape') open = false;
  }

  $: if(open && textElement) textElement.focus();


  function openLinksInNewTab(e) {
    if(e.target.hasAttribute('href')) {
      e.preventDefault();
      const url = e.target.getAttribute('href');
      window.open(url, '_blank');
    }
  }


</script>

<button class="about__toggle"
        id="about__toggle"
        bind:this={button}
        aria-expanded={open}
        aria-controls="about"
        on:click={() => open = !open}>
  <img src="{themeBase}/images/info.svg" alt="{ t('About the project') }" />
</button>

{#if open}
<section class="about" id="about"
         on:keyup={onKeyUp}
         transition:fade={{ duration: 250 }}>
  <div class="about__inner" bind:this={textElement} on:click={openLinksInNewTab} tabindex="0">
    {@html text}
  </div>

  <button class="about__close close round-button"
          on:click={() => open = false}>
    <CloseIcon />
  </button>
</section>
{/if}