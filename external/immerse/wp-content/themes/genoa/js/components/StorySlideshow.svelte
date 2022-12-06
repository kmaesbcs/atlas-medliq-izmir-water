<!-- Images / video Slideshow -->
<script lang="ts">
  import {Swiper, SwiperSlide} from 'swiper/svelte';
  import {Navigation, Pagination, Keyboard, Mousewheel, EffectFade} from 'swiper';
  import {t, MOBILE_WIDTH, homeUrl, themeBase} from '@components/common.js';
  import { createEventDispatcher } from 'svelte';
  import { isMobile } from '@components/stores.js';
  import Picture from "@components/Picture.svelte";

	export let story;
  let slideHasChanged = false;
  let currentSlideIndex = 0;
  let pictures = [];
  let swiper;

  const dispatch = createEventDispatcher();

  // Reset to the first slide on each story change
  $: if(story && swiper) {
    swiper.slideTo(0);
    dispatch('change', { isLastSlide: false, currentSectionId: 0, slideHasChanged: true });
  }

  // Send the section number or -1 (meaning materials), if available
  function slideChange(e) {
    const [[swiper]] = e.detail;
    const currentSlide: HTMLElement = swiper.slides[swiper.realIndex];
    currentSlideIndex = swiper.realIndex;
    const isLastSlide = swiper.realIndex >= swiper.slides.length - 1;
    const currentSectionId =  parseInt(currentSlide.dataset.sectionId, 0);

    slideHasChanged = true;

    currentSlide.querySelectorAll('video').forEach(video => video.currentTime = 0);

    dispatch('change', {
      isLastSlide, currentSectionId, slideHasChanged,
    });
  }

</script>
<Swiper
  class="story__slideshow"
  modules="{[Navigation, Pagination, Mousewheel, Keyboard,  EffectFade]}"
  on:swiper={e => swiper = e.detail[0]}
  effect="fade"
  speed="{1500}"
  fadeEffect="{{ crossFade: false }}"
  on:slideChange={slideChange}
  direction="vertical"
  mousewheel="{{ sensitivity: 5 }}"
  keyboard
  navigation={{ nextEl: '.slideshow__nav--next', prevEl: '.slideshow__nav--prev' }}
>

  <button class="slideshow__nav slideshow__nav--prev round-button" class:visuallyhidden={currentSlideIndex == 0}>
    <svg class="up-icon"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 22.99 12.48">
      <title>{t('Previous slide')}</title>
      <path d="M18.21,7.8L9.61,1,1,7.8" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
  </button>

  <button class="slideshow__nav slideshow__nav--next" class:is-throbbing={!slideHasChanged}>
    <svg class="down-icon"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 22.99 12.48">
      <title>{t('Next slide')}</title>
      <path d="M1,1L9.61,7.8,18.21,1" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
  </button>

  {#each story.sections as section, sectionIndex}
    {#each section.images as slide, slideIndex}
      <SwiperSlide data-section-id="{sectionIndex}" class="story__slide slide">
        <Picture eager="{ slideIndex === 0 && sectionIndex === 0 }" picture={slide} class="slide__picture" />
      </SwiperSlide>
    {/each}
  {/each}
</Swiper>
