<script lang="ts">
  import type {Story} from "@components/types";
  import Picture from "@components/Picture.svelte";
  import Links from "@components/Links.svelte";
  import SectionText from "@components/SectionText.svelte";
  import {onDestroy, onMount} from "svelte";

  export let story: Story;
  let sections = [];
  let pictures = {};
  let observers = [];
  let observer;

  $: if(story && story.sections) sections = story.sections;

  // Rewind videos when we scroll to them

  onMount(() => {
    observer = new IntersectionObserver((els) => {
      els.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target
              .querySelectorAll('video')
              .forEach(video => video.currentTime = 0);
        }
      });
    });

    Object.values(pictures).forEach(x => observer.observe(x));
  });

  onDestroy(() => {
    observer.disconnect();
  });
</script>

<section class="mobile-story">
  {#each sections as currentSection, currentSectionId}
    {#each currentSection.images as image, imageId}
      <div class="mobile-story__image-wrapper"
           bind:this={pictures[currentSectionId + '_' + imageId]}>
        <Picture picture={image}
                 class="mobile-story__image fill fill-image" />
      </div>
    {/each}

    <div class="mobile-story__text">
      <SectionText currentSection={currentSection}
                   currentSectionId={currentSectionId}
                   story={story} />
    </div>
  {/each}
</section>