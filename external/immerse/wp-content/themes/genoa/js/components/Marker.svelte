<script>
  import {createEventDispatcher, tick} from 'svelte';
  import mapboxgl from "mapbox-gl";
  import Audio from "@components/Audio.svelte";

  const dispatch = createEventDispatcher();

  export let item;
  export let map;
  export let currentItem;

  export let cursorX;
  export let cursorY;
  export let containerWidth;
  export let containerHeight;
  export let maxVolume;

  let number;
  let numberSize;
  let size;
  let bg;
  let volume = 0;

  const distanceFactor = 9;
  const distanceMinimum = 0.05;
  const iconSize = 300;

  let numberkMarker;
  let markerTransform;

  // Add markers to the map
  $: if (map) {
    map.on('load', () => {
      const lng = parseFloat(item.location.lng);
      const lat = parseFloat(item.location.lat);
      numberkMarker = new mapboxgl.Marker(number).setLngLat({lng, lat}).addTo(map);
      adjustTransforms();
    });

    map.on('move', () => {
      adjustTransforms()
    });

    map.on('moveend', () => {
      adjustTransforms()
    });
  }

  // Since the background (blob) markers have to be on a separate layer to work,
  // the only "real" markers are the numbers. And we're moving the background blobs to
  // where the numbers are, manually, whenever the map moves or changes.
  function adjustTransforms() {
    markerTransform = number.style.transform;
  }

  // On mouse move, change the width and height of the background,
  // so the closer we are to the mouse cursor, the bigger the background.
  // Note that this also changes how loudly the relevant sound is played.
  $: if (containerHeight && containerWidth && bg && cursorX > -1) {
    const stageDiagonal = Math.sqrt(containerWidth * containerWidth + containerHeight * containerHeight);
    const rect = bg.getBoundingClientRect();
    const iX = rect.left + window.scrollX + rect.width / 2;
    const iY = rect.top + window.scrollY + rect.height / 2;
    const distance = Math.hypot(iX - cursorX, iY - cursorY);

    const distancePercentage = Math.pow((stageDiagonal - distance) / stageDiagonal, distanceFactor);
    const adjustedPercentage = Math.max(distancePercentage, distanceMinimum);

    if (!currentItem) {
      size = adjustedPercentage * iconSize;
      volume = adjustedPercentage * parseFloat(maxVolume);
    }
  }

  // Are the current Item?
  let isCurrentItem;
  $: isCurrentItem = currentItem && currentItem === item;

</script>

<Audio shouldPlay={!currentItem} volume={volume} src={item.mapSound} />

<a class="map__marker marker"
   class:is-current={isCurrentItem}
   class:is-highlighted={size > numberSize * 1.5}
   bind:this={number}
   bind:clientWidth={numberSize}
   href="#/{item.slug}"
   aria-label="{item.title}">
  <slot></slot>
</a>

<div class="marker marker--bg"
     class:is-current={isCurrentItem}
     style="transform: {markerTransform};
            width: {size}px; height: {size}px;"
     bind:this={bg}>
</div>

