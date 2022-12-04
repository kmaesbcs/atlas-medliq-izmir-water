<script>
  import {themeBase,t} from "@components/common";

  export let files;
  export let title;
</script>

{#if files && files.length}
  {#if title}
    <h2 class="download-buttons__title">{title}</h2>
  {/if}

  <nav class="buttons download-buttons {$$props.class}" class:is-with-title={title}>
    {#each files as file}
      <a class="button download-button" download href="{file.url}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.15466 4.78606L5.84835 8.47975M5.84835 8.47975L9.54203 4.78606M5.84835 8.47975V0.25" stroke="#353535"/>
          <path d="M0 10.75H11.3889" stroke="#353535"/>
        </svg>

        <span class="button__label">{file.title || t('Download file')}</span>
      </a>
    {/each}
  </nav>
{/if}