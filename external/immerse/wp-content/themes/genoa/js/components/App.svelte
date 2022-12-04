<script>
	import Map from "@components/Map.svelte";
	import {onMount} from "svelte";
	import Story from "@components/Story.svelte";
	import { legendOpen } from '@components/stores';
	import Intro from "@components/Intro.svelte";
	import Sidebar from "@components/Sidebar.svelte";

	export let options = null;
	export let stories = null;
	export let languages = null;
	export let currentLanguage = null;

	let currentItem = null;
	let mapComponent;

	onMount(() => {
		// Delete the static loader
		document.getElementById('static-load').remove();

		// Set up the "router"
		window.addEventListener('hashchange', () => {
			onRoute(window.location.hash);
		});

		window.addEventListener('load', () => {
			onRoute(window.location.hash, true);
		});
	});

	// "Router"
	function onRoute(hash, immediate = false) {
		if(hash.indexOf('#/') === false) return false;
		const slug = hash.replace('#/', '');
		currentItem = getItemBySlug(slug);
	}

	function getItemBySlug(slug) {
		const matching = stories.filter(x => x.slug === slug);
		return matching ? matching[0] : null;
	}

	let isDebug = false;
	$: isDebug = window.location.hash.indexOf('#debug') !== -1;


</script>


<main class="app" class:is-legend-open={$legendOpen} class:is-debug={isDebug}>

	<Intro options={options} />

	<Map stories={stories}
			 bind:this={mapComponent}
			 currentItem={currentItem}
			 options={options} />

	<Story story={currentItem} options={options}  />

	<Sidebar options={options} languages={languages} currentLanguage={currentLanguage} />
</main>
