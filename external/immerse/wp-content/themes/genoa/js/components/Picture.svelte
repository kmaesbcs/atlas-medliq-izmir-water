<script type="ts">
  import {isMobile} from "@/components/stores.js";
  import type {StoryImage} from "@components/types";

  export let picture: StoryImage;
  export let sizes = ['1600', '1920', '2560'];
  export let eager = false;

  let video;
  let mobileVideo;

  export function rewind() {
    const videos = [video, mobileVideo];
    videos.forEach(i => {
      i.currentTime = 0;
    });
  }

</script>
<div class="{$$props.class} picture">
<picture class="picture__image fill fill-image" style="--focus: {picture.focus}">

  {#if picture.mobileImage}
    <source data-size="720"
            media="(orientation: portrait)"
            srcset="{picture.mobileImage ?
                          picture.mobileImage['thumb-720'] :
                          picture.image['thumb-720']}">
  {/if}

  {#each sizes as size}
    <source data-size="{ size }"
            media="(max-width: { size }px)"
            srcset="{picture.image['thumb-' + size]}">
  {/each}


  <img loading="{eager ? 'eager' : 'lazy'}" src="{picture.image['thumb-2560']}" alt=""/>
</picture>


{#if (picture.video && !$isMobile) || (picture.video && !picture.mobileVideo)}
  <video src="{picture.video}" autoplay playsinline loop muted webkit-playsinline
         bind:this={video} preload="metadata"
         class="fill fill-image picture__video picture__video"></video>
{/if}

{#if picture.mobileVideo && $isMobile}
  <video src="{picture.mobileVideo}" autoplay playsinline loop muted webkit-playsinline
         bind:this={mobileVideo} preload="metadata"
         class="fill fill-image picture__video picture__video"></video>
{/if}

</div>