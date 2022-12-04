<script>
  import AboutPopup from "@components/AboutPopup.svelte";
  import {themeBase, t, getLanguagePath} from "@components/common";
  import { muted } from '@components/stores';

  export let options;
  export let languages;
  export let currentLanguage;

  function toggleMute() {
    muted.update(value => !value);
  }

  $: languageLinks = Object.values(languages).map(language => {
    language.url = getLanguagePath(language.code);
    return language;
  });
</script>

<aside class="sidebar">
  <a href="https://medliq.art" class="sidebar__link">
    <picture class="sidebar__logo">
      <source srcset="{themeBase}/images/globe-logo-left.svg" media="(max-width: 764px)" />
      <source srcset="{themeBase}images/globe-logo-up.svg" media="(min-width: 765px)" />
      <img src="{themeBase}/images/globe-logo-up.svg" alt="Back" />
    </picture>
  </a>

  <h1 class="sidebar__title">
    Immerse
  </h1>

  <div class="sidebar__bottom">
    <button class="toggle-mute" on:click={toggleMute}>
      {#if !$muted}
        <img width="21" height="18"
          src="{themeBase}/images/speaker.svg" alt="{t('Sound on')}" />
      {:else}
        <img width="21" height="18"
          src="{themeBase}/images/speaker-off.svg" alt="{t('Sound off')}" />
      {/if}
    </button>

    <nav class="languages">
      {#each languageLinks as language}
        <a href="{language.url}"
           class="language"
           class:is-current={language.code === currentLanguage}
           title={language.native_name}
           hreflang="{language.code}">
          {language.code}
        </a>
      {/each}
    </nav>

    <AboutPopup text="{options.aboutUsText}" />
  </div>
</aside>
