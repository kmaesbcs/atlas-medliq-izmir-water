<script>
  import mapboxgl from 'mapbox-gl';
  import {onMount} from "svelte";
  import { createEventDispatcher } from 'svelte';
  import MapDebug from "@components/MapDebug.svelte";
  import Marker from "@components/Marker.svelte";
  import {themeBase} from "@components/common";
  import Legend from "@components/Legend.svelte";
  import { isMobile } from '@components/stores';

	const dispatch = createEventDispatcher();

  export let stories;
  export let options;
  export let currentItem;

  let map = null;
  let markers = [];


  let bounds;
  const mapPaintingCoords = [
    [8.710, 44.512],
    [9.076, 44.512],
    [9.076, 44.327],
    [8.710, 44.327]
  ];
  const mapPaintingBounds = [
    mapPaintingCoords[3],
    mapPaintingCoords[1],
  ];
  const mapPaintingUrl = themeBase + 'images/map.jpg';

  /**
   * Create map, and initialize the markers
   */
  onMount(async () => {
    mapboxgl.accessToken = options.mapboxApiKey;
    map = new mapboxgl.Map({
      container: 'map',
      attributionControl: false,
      style: options.mapboxStyle,
    });

    map.addControl(new mapboxgl.AttributionControl(), 'top-right');
    mapBounds();

    map.on('load', () => {
      addPaintingLayer();
    });

    map.resize();
    setTimeout(() => map.resize(), 500);
  });

  /**
   * Add the layer with the old map
   */
  function addPaintingLayer() {
    if(window.location.hash.indexOf('#debug') !== -1) return;

    map.addSource('painting', {
      type: 'image',
      url: mapPaintingUrl,
      coordinates: mapPaintingCoords,
    });

    map.addLayer({
      id: 'painting-layer',
      type: 'raster',
      source: 'painting',
      'paint': {
        'raster-fade-duration': 0
      }
    });
  }

  function mapBounds(padding = 200) {
    if(window.location.hash.indexOf('#debug') !== -1) return;
    bounds = new mapboxgl.LngLatBounds();
    stories.forEach(story => bounds.extend([story.location.lng, story.location.lat]));
    map.setMaxBounds(mapPaintingBounds);

    if($isMobile) {
      const center = bounds.getCenter();
      map.flyTo({ center, zoom: 12 });
    }
    else {
      map.fitBounds(bounds, {padding, linear: true, duration: 0});
    }
  }


  /**
   * Add margins to a bounds object
   */
  function boundsWithMargin(bounds, hMargin, vMargin) {
    bounds = new mapboxgl.LngLatBounds(bounds);
    const s = bounds.getSouth() - vMargin;
    const n = bounds.getNorth() + vMargin;
    const w = bounds.getWest() + hMargin;
    const e = bounds.getEast() - hMargin;
    return [w, s, e, n]
  }


  /**
   * Get the global cursor x and y for the marker effects
   */
  let x = -1;
  let y = -1;
  let width = 0;
  let height = 0;
  function onMouseMove(e) {
    x = e.clientX;
    y = e.clientY;
  }
</script>

<svelte:options accessors={true} />

<div class="wrapper"
     class:is-current-item={!!currentItem}
     on:mousemove={onMouseMove}
     bind:clientWidth={width} bind:clientHeight={height}>
  <div id="map"></div>

  <MapDebug map={map} />

  <div class="markers__stage">
    {#each stories as item, index}
      <Marker map={map} item={item}
              currentItem={currentItem}
              cursorX={x} cursorY={y}
              maxVolume={options.maxVolume ? options.maxVolume : 1}
              containerWidth={width} containerHeight={height}>
        {index + 1}
      </Marker>
    {/each}
  </div>

  <Legend stories={stories} />
</div>


<style>
  #map {
    width: 100%;
    height: 100%;
  }
</style>