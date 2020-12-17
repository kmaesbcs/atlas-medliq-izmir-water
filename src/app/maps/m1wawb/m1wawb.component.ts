import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { ApiService } from '../../api.service';
import { MapService } from '../../map.service';
import { PlayerService } from '../../player.service';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-m1wawb',
  templateUrl: './m1wawb.component.html',
  styleUrls: ['./m1wawb.component.less']
})
export class M1wawbComponent implements OnInit {
  
  @ViewChild('mapEl', {static: true}) mapEl: ElementRef;

  theMap: mapboxgl.Map;
  samples = new ReplaySubject<GeoJSON.FeatureCollection>(1);
  sample = null;
  info = false;

  LAYER_NAME = 'above-below-sample';
  SOURCE_NAME = 'samples';

  constructor(private api: ApiService, private map: MapService, private player: PlayerService) {
    api.m1GetSamples().subscribe((samples) => {
      console.log('SAMPLES', samples);
      this.samples.next(samples);
    });
  }

  ngOnInit(): void {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: 'mapbox://styles/atlasmedliq/ckioczj9i39w717peyp20en12/draft',
      minZoom: 3,
    });
    this.theMap.on('style.load', () => {
      this.samples.pipe(first()).subscribe((samples: GeoJSON.FeatureCollection) => {
        this.theMap.addSource(this.SOURCE_NAME, {type: 'geojson', data: samples});
        this.map.setLayerSource(this.theMap, this.LAYER_NAME, this.SOURCE_NAME);
        this.theMap.on('mouseenter', this.LAYER_NAME, () => {
          this.theMap.getCanvas().style.cursor = 'pointer';
        });
        this.theMap.on('mouseleave', this.LAYER_NAME, () => {
          this.theMap.getCanvas().style.cursor = '';
        });
        this.theMap.on('click', this.LAYER_NAME, (e) => {
          this.sample = e.features[0].properties;
          this.info = false;
          console.log('CLICKED', this.sample)
          // const audio = new Audio(item.audio_above);
          // fromEvent(audio, 'canplaythrough').pipe(first()).subscribe(() => {
          //   audio.play();
          // })
        });
      });
    });
  }
}
