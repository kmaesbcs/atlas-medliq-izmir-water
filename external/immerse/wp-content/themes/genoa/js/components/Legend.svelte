<script>
  import {t} from '@components/common';
  import chunk from 'lodash/chunk';
  import {legendOpen} from "@components/stores";

  export let stories;
  export let toggleIcon = false;

  let columnSize;
  let columns;

  $: toggleLabel = $legendOpen ? t('Hide legend') : t('Show legend');
  $: if(stories) columnSize = Math.floor(stories.length / 2);
  $: if(stories) columns = chunk(stories, columnSize);

  function toggle() {
    legendOpen.update(x => !x);
  }
</script>

<nav class="legend" class:is-show={$legendOpen}>
  <button class="legend-toggle legend__toggle" on:click={toggle}>

    {#if toggleIcon}
      <svg class="legend-toggle__icon"
           width="11" height="8"
           viewBox="0 0 11 8"
           fill="none" xmlns="http://www.w3.org/2000/svg">
      {#if $legendOpen}
          <path d="M1 0.999817L5.5 6.53828L10 0.999817" stroke="#353535" stroke-linecap="round" stroke-linejoin="round"/>
      {:else}
          <path d="M10 6.53827L5.5 0.999808L1 6.53827" stroke="#353535" stroke-linecap="round" stroke-linejoin="round"/>
      {/if}
      </svg>
    {/if}

    <span class="legend-toggle__label toggle-title">{toggleLabel}</span>
  </button>

  <ul class="legend__items">
    {#each columns as column, columnIndex}
      <ul class="legend__column">
        {#each column as story, storyIndex}
          <li class="legend__item">
            <span class="legend__number">
              {columnIndex * columnSize + storyIndex + 1}.
            </span>
            <a href="#/{story.slug}">
              {story.title}
            </a>
          </li>
        {/each}
      </ul>
    {/each}
  </ul>
</nav>