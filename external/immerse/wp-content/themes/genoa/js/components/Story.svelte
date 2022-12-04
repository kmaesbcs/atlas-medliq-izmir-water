<script lang="ts">
  import {t, homeUrl, italian, themeBase} from '@components/common.js';
  import {isMobile} from '@components/stores.js';
  import {fade} from 'svelte/transition';

  import 'swiper/css/bundle';
  import Audio from "@components/Audio.svelte";
  import StorySlideshow from "@components/StorySlideshow.svelte";
  import type {Story} from "@components/types";
  import StoryInfo from "@components/StoryInfo.svelte";
  import MobileStory from "@components/MobileStory.svelte";
  import CloseIcon from "@components/CloseIcon.svelte";

  export let story: Story;
  export let options;

</script>

{#if story}
  <section class="story" in:fade={{ delay: 1000 }} out:fade={{ delay: 0 }}>
    <Audio shouldPlay={story}
           volume={options.maxVolume ? options.maxVolume : 1}
           src={story.backgroundSound}/>

    <a class="close round-button" href="{italian ? '/it/' : ''}#">
      <CloseIcon />
    </a>

    {#if $isMobile}
      <MobileStory story={story} />
    {:else}
      <StoryInfo story={story} />
      <StorySlideshow story={story}/>
    {/if}
  </section>
{/if}