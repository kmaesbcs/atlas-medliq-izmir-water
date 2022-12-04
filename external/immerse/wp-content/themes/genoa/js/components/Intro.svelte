<script>
  // Intro
  import {muted} from "@components/stores";
  import Dialog from "@components/Dialog.svelte";
  import {themeBase} from "@components/common";

  export let options;
  let showIntro = true;

  function closeIntro() {
    showIntro = false;
    muted.set(false);
  }
</script>

{#if showIntro}
  <Dialog className="intro" on:close={closeIntro}>
    <div class="intro__text">
      {@html options.introText}
    </div>

    <div class="intro__sound toggle-title">
      <img alt="" class="intro__sound-icon" src="{themeBase}/images/headphones.svg"/>

      {@html options.introSoundText}
    </div>

    <button class="button intro__button" on:click={closeIntro}>
      {options.introButtonLabel}
    </button>
  </Dialog>
{/if}