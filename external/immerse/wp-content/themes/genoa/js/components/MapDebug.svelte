<script>
  import mapboxgl from "mapbox-gl";
  import {themeBase} from "@components/common";

  export let map = null;

  let debug = false;
  let positionText = '';
  let clickedPositionText = '';
  let debugRectText = '';

  /**
   * Show the zoom, [lng,lat] in the debug window
   */
  function updateDebugInfoOnPanZoom() {
    const zoom = map.getZoom();
    const position = map.getCenter();

    positionText = `${zoom.toFixed(3)}, [${position.lng.toFixed(3)}, ${position.lat.toFixed(3)}]`;
  }

  /**
   * When #debug is found in the hash, show the debug window.
   * If #debug-rect=(image filename) is found, use rect debugging
   */
  export function load() {
    if (window.location.hash.indexOf('#debug') === -1) {
      debug = false;
      return;
    } else {
      debug = true;
    }

    updateDebugInfoOnPanZoom();
    map.on('moveend', () => updateDebugInfoOnPanZoom());
    map.on('zoomend', () => updateDebugInfoOnPanZoom());
    map.on('click', (e) => {
      clickedPositionText = `[${e.lngLat.lng.toFixed(3)}, ${e.lngLat.lat.toFixed(3)}]`;
    });

    debugDrawRect();
  }

  $: if (map) {
    map.on('load', () => {
      load();
    });
  }

  /**
   * Debug rect drawing on the map, for arrows
   */
  let debugRectMarkers = [
    {
      position: [8.707, 44.537],
      marker: null,
    },
    {
      position: [9.063, 44.302],
      marker: null,
    }
  ];

  function debugDrawRect() {
    if (window.location.hash.indexOf('#debug-rect=') !== -1) {
      createRectOverlay();
      createRectMarkers();
    }
  }

  /**
   * Get the width and height of the image, so we can
   * get its ratio and proportionally resize it
   */
  let imageWidth = 0;
  let imageHeight = 0;
  function getImageWidthHeight(url) {
    const img = document.createElement('img');
    img.onload = function() {
      imageHeight = this.height;
      imageWidth = this.width;
    }
    img.src = url;
  }


  /**
   * Create the initial overlay and layer
   */
  function createRectOverlay() {
    const imageSlug = window.location.hash.replace('#debug-rect=', '');
    const url = themeBase + imageSlug;

    getImageWidthHeight(url);
    map.addSource('rect', {
      type: 'image',
      url: url,
      coordinates: [
        [8.707, 44.537],
        [9.063, 44.537],
        [9.063, 44.302],
        [8.707, 44.302]
      ]
    });

    map.addLayer({
      id: 'rect-layer',
      type: 'raster',
      source: 'rect',
      'paint': {
        'raster-fade-duration': 0,
        'raster-opacity': 0.5,
      }
    });
  }

  /**
   * The heart of the rect debug: draw the image overlay
   * based on the two markers on the screen: the "startMarker" and "endMarker".
   * And then, output the GPS locations for the bounds, so we can put it as a layer.
   */
  function updateOverlayPosition() {
    const startMarker = debugRectMarkers[0].position;
    const endMarker = debugRectMarkers[1].position;
    const imageRatio = imageHeight ? imageWidth / imageHeight : 1;

    // Proportionally resize
    let x = endMarker[0];
    let y = endMarker[1];
    const height = startMarker[1] - endMarker[1];
    const width = startMarker[0] - endMarker[0];
    //const end = [startMarker[0] + height * imageRatio, y];
    const end = [x, y];

    const rect = [
      [startMarker[0], startMarker[1]],
      [end[0], startMarker[1]],
      [end[0], end[1]],
      [startMarker[0], end[1]],
    ];

    if (rect && rect[0] && rect[0][1]) {
      map.getSource('rect').setCoordinates(rect);
      debugRectText = `
          [<br>
            &nbsp;&nbsp;[${rect[0][0].toFixed(3)}, ${rect[0][1].toFixed(3)}],<br>
            &nbsp;&nbsp;[${rect[1][0].toFixed(3)}, ${rect[1][1].toFixed(3)}],<br>
            &nbsp;&nbsp;[${rect[2][0].toFixed(3)}, ${rect[2][1].toFixed(3)}],<br>
            &nbsp;&nbsp;[${rect[3][0].toFixed(3)}, ${rect[3][1].toFixed(3)}]<br>
          ]
        `;
    }
  }

  /**
   * Create the two markers, for the top corner-left and bottom-right corners
   */
  function createRectMarkers() {
    const onDrag = (index, position) => {
      debugRectMarkers[index].position = [position.lng, position.lat];
      updateOverlayPosition();
    };

    debugRectMarkers.forEach((marker, index) => {
      marker.marker = new mapboxgl.Marker({
        draggable: true,
      })
          .setLngLat(marker.position)
          .on('drag', (e) => onDrag(index, e.target.getLngLat()))
          .addTo(map);
    });
  }

</script>

{#if debug}
  <div class="map__debug">
    {positionText}<br>
    {clickedPositionText}<br>
    {@html debugRectText}<br>
  </div>
{/if}

<style>
  .map__debug {
    position: fixed;
    top: 20px;
    left: 20px;
    background: white;
    z-index: 200;
  }
</style>