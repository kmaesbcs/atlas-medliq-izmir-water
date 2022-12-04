<script lang="ts">
  import {muted} from "@components/stores";

  export let shouldPlay: boolean = false;
  export let volume: number;
  export let src: string;

  let audio: HTMLAudioElement;

  $: if((volume || !volume) && audio) audio.volume = volume;

  // Automatically play if we should play, and it's not muted
  $: if (shouldPlay && audio && !$muted)
      audio.play().catch(e => {})
    else if(audio) {
      audio.pause();
    }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<audio bind:this={audio} loop class="sound" src="{src}"></audio>
