<script lang="ts">
  import { t } from '@components/common.js';
  import Links from "@components/Links.svelte";
  import DownloadButtons from "@components/DownloadButtons.svelte";

  export let currentSection;
  export let currentSectionId;
  export let story;
  let isMaterialsSection = false;

  let files;
  let links;

  $: if (currentSection) {
    isMaterialsSection = currentSection.materialsSection;
  }

  function getFilesLinks(key: 'files' | 'links') {
    return (currentSection && currentSection[key]) ? currentSection[key] : false;
  }

  $: if (currentSection) files = getFilesLinks('files');
  $: if (currentSection) links = getFilesLinks('links');

</script>

<div class={$$props.class + ' story-text'}>
  {#if currentSectionId === 0}
    <h1>{story.title}</h1>
  {/if}

  {#if currentSection}
    {@html currentSection.text}
  {/if}
</div>

<DownloadButtons files={files}
                 class={ isMaterialsSection ? 'download-buttons--materials links' : '' }
                 title={ isMaterialsSection ? t('Files') : null }/>

<Links links={links}
       class={ isMaterialsSection ? 'links--materials' : '' }
       title={ isMaterialsSection ? t('Further Reading') : null }/>
