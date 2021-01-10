import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TroubledwatersService } from './troubledwaters.service';
import * as mapboxgl from 'mapbox-gl';
import { FeatureCollection, Feature, Point } from 'geojson';
import { first } from 'rxjs/operators';
import { MapService } from 'src/app/map.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-troubledwaters',
  templateUrl: './troubledwaters.component.html',
  styleUrls: ['./troubledwaters.component.less']
})
export class TroubledwatersComponent implements OnInit {

  theMap: mapboxgl.Map;
  info = false;
  currentTimestamp = '';

  @ViewChild('mapEl', {static: true}) mapEl: ElementRef;

  constructor(private troubledWaters: TroubledwatersService, private map: MapService,
              private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: 'mapbox://styles/atlasmedliq/ckiocyuoy4o9217qsvjosbxxj',
      minZoom: 3,
    });
    this.theMap.on('style.load', () => {
      this.theMap.setLayoutProperty('trouble-waters-points', 'visibility', 'visible');
      this.theMap.setLayoutProperty('trouble-waters-markers', 'visibility', 'visible');
      this.initialize();
    });
  }

  setPosition(segment?: any, timestamp?: any, offset?: number) {
    this.router.navigate(['m3'], {
      queryParams: {segment, timestamp}
    });
  }

  initialize() {
    this.initializeMarkers();
    this.initializeMapView();
    this.initializeNavigation();
  }

  initializeNavigation() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.troubledWaters.setPosition({
        segment: params.segment,
        timestamp: params.timestamp,
        offset: params.offset,
        who: params.who || 'router'
      });
    })
  }

  initializeMarkers() {
    const LAYER_NAME = 'trouble-waters-points';
    const SOURCE_NAME = 'markers';
    this.troubledWaters.data.pipe(first()).subscribe((data) => {
      const markers: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };
      data.forEach((segment) => {
        segment.audio_timestamps.forEach((timestamp) => {
          timestamp.segment = segment.id;
          if (timestamp.coordinates) {
            const feature: Feature = {
              type: 'Feature',
              properties: timestamp,
              geometry: {
                type: 'Point',
                coordinates: [timestamp.coordinates[1], timestamp.coordinates[0]]
              } as Point,
              id: markers.features.length + 1
            };
            markers.features.push(feature);  
          }
        });
      });
      this.theMap.addSource(SOURCE_NAME, {
        type: 'geojson', data: markers
      });
      this.map.setLayerSource(this.theMap, LAYER_NAME, SOURCE_NAME);

      let hoveredStateId = null;
      this.theMap.on('mouseover', LAYER_NAME, (e) => {
        this.theMap.getCanvas().style.cursor = 'pointer';
        var features = this.theMap.queryRenderedFeatures(e.point);
        if (features.length > 0 && features[0].layer.id === LAYER_NAME) {
          if (hoveredStateId) {
            this.theMap.setFeatureState({source: SOURCE_NAME, id: hoveredStateId}, {hover: false});
          }
          hoveredStateId = features[0].id;
          this.theMap.setFeatureState({source: SOURCE_NAME, id: hoveredStateId}, {hover: true});
        }
      });      
      this.theMap.on('click', LAYER_NAME, (e) => {
        var features = this.theMap.queryRenderedFeatures(e.point);
        if (features.length > 0 && features[0].layer.id === LAYER_NAME) {
          this.setPosition(null, features[0].properties.id, null);
        }
      });
      this.theMap.on('mouseleave', LAYER_NAME, () => {
        this.theMap.getCanvas().style.cursor = '';
        if (hoveredStateId) {
          this.theMap.setFeatureState({source: SOURCE_NAME, id: hoveredStateId}, {hover: false});
        }
        hoveredStateId = null;
      });
    })
  }

  initializeMapView() {
    this.troubledWaters.position.subscribe((position) => {
      const segment = position.segment;
      const timestamp = position.timestamp;
      if (timestamp.id === this.currentTimestamp) {
        return;
      }
      this.currentTimestamp = timestamp.id;
      const flyTo = this.map.parseMapView(timestamp);
      if (flyTo) {
        this.theMap.flyTo(flyTo);
      }
      this.theMap.setFilter('trouble-waters-markers', [
        "all",
        [
          "match",
          ["get", "segment"],
          [segment.name] || ['__non_existent'],
          true,
          false
        ],
        [
          "match",
          ["to-string", ["get", "name"]],
          timestamp.filter || ['__non_existent'],
          true,
          false
        ]
      ]);
    });
  }

}
