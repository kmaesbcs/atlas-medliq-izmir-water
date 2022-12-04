<script lang="ts">
  import {t} from '@components/common.js';
  import type {Story} from "@components/types";
  import isNumber from "lodash/isNumber";
  import {mod} from "@/utils";
  import {fade} from 'svelte/transition';
  import SectionText from "@components/SectionText.svelte";

  export let story: Story;
  export let toggleIcon = false;

  let showText = false;
  let currentSectionId = 0;
  let currentSection;
  let textHeight = 0;

  $: if (isNumber(currentSectionId) && story) {
    currentSection = story.sections[currentSectionId];
  }

  let toggleTextLabel;
  $: toggleTextLabel = showText ? t('Hide text') : t('Show text');

  function nextSection() {
    currentSectionId = mod(currentSectionId + 1, story.sections.length);
  }

  function previousSection() {
    currentSectionId = mod(currentSectionId - 1, story.sections.length);
  }

</script>

<section class="story-info" hidden={!showText}>
  <div class="story-info__bg"
       style="--height: {textHeight}px"
  ></div>

  {#key currentSectionId}
    <div class="story-info__inner"
         in:fade={{ delay: 500 }}
         out:fade={{ speed: 250 }}
         bind:clientHeight={textHeight}>

      {#if currentSectionId > 0}
        <button on:click={previousSection} class="section-nav section-nav--prev">
          <svg xmlns="http://www.w3.org/2000/svg"
               width="22.354" height="11.53" viewBox="0 0 22.354 11.53">
            <defs><title>{ t('Previous section') }</title></defs>
            <path d="M0,0,11,11,22,0"
                  transform="translate(22.177 11.354) rotate(180)"
                  fill="none" stroke="#2b2e34" stroke-width="0.5"/>
          </svg>
        </button>
      {/if}

      <SectionText currentSection={currentSection}
                   currentSectionId={currentSectionId}
                   story={story} />

      {#if currentSectionId < story.sections.length - 1}
        <button on:click={nextSection} class="section-nav section-nav--next">
          <svg xmlns="http://www.w3.org/2000/svg"
               width="22.354" height="11.53" viewBox="0 0 22.354 11.53">

            <defs><title>{ t('Next section') }</title></defs>
            <path d="M0,0,11,11,22,0" transform="translate(0.177 0.177)"
                  fill="none" stroke="#2b2e34" stroke-width="0.5"/>
          </svg>
        </button>
      {/if}

    </div>
  {/key}

  <!-- Toggle button -->
  <button class="story-info__toggle side-toggle"
          class:is-open={showText}
          on:click={() => showText = !showText}>
    {#if toggleIcon}
      <svg width="8" height="11" viewBox="0 0 8 11" class="side-toggle__icon"
           fill="none" xmlns="http://www.w3.org/2000/svg">
          {#if showText}
            <path d="M7 1L1.46154 5.5L7 10" stroke="#353535" stroke-linecap="round" stroke-linejoin="round"/>
          {:else}
            <path d="M1.46155 1L7.00001 5.5L1.46155 10" stroke="#353535" stroke-linecap="round"
                  stroke-linejoin="round"/>
          {/if}
      </svg>
    {/if}

    <span class="side-toggle__text toggle-title">{toggleTextLabel}</span>
  </button>
</section>
