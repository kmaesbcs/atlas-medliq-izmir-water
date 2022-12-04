<script lang="ts">
  import {t, homeUrl, italian, themeBase, getCurrentLanguagePath} from '@components/common.js';
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

  // On firefox, moving between stories doesn't work too well.
  // So we'll silently reload the page instead by appending / instead of # to the close button
  function getCloseButtonLink() {
    const path = getCurrentLanguagePath()
    const isFirefox = navigator.userAgent.match(/firefox|fxios/i);
    const sigil = isFirefox ? '' : '#';
    return path + sigil;
  }

</script>

{#if story}
  <section class="story" in:fade={{ delay: 1000 }} out:fade={{ delay: 0 }}>
    <Audio shouldPlay={story}
           volume={options.maxVolume ? options.maxVolume : 1}
           src={story.backgroundSound}/>

    <a class="close round-button" href="{getCloseButtonLink()}">
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