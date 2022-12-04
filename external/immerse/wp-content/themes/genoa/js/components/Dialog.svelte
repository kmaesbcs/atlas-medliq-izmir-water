<script>
  import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

  export let className;

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close', {});
  }
</script>

<div class="dialog__wrapper center fill {className}" transition:fade={{ duration: 150 }}>
  <div class="dialog">
    <slot></slot>
  </div>

  <button
     on:click={close}
     class="dialog__overlay fill"></button>

</div>
