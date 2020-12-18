import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

import { SpecToursService } from './spectours.service';

@Component({
  selector: 'app-spectours',
  templateUrl: './spectours.component.html',
  styleUrls: ['./spectours.component.less']
})
export class SpecToursComponent implements OnInit {

  timeline = [];
  theMap: mapboxgl.Map;
  @ViewChild('mapEl', {static: true}) mapEl: ElementRef;

  constructor(private api: SpecToursService) {
    api.fetchData().subscribe((timeline) => {
      this.timeline = timeline;
    });
  }

  ngOnInit(): void {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: 'mapbox://styles/atlasmedliq/ckiodibg82x1k17tcof8e9pmd/draft',
      minZoom: 3,
    });
  }

  changeMapView(mapView) {
    console.log('mapView', mapView);
    const geoRe = /center:\s*\{\s*lon:\s*([-0-9.]+),\s*lat:\s*([-0-9.]+)\s*\},\s*zoom:\s*([-0-9.]+),\s*pitch:\s*([-0-9.]+),\s*bearing:\s*([-0-9.]+)/g;
    const parsed = geoRe.exec(mapView.geo);
    const options = {
      center: {
        lon: parseFloat(parsed[1]),
        lat: parseFloat(parsed[2]),
      },
      zoom: parseFloat(parsed[3]),
      pitch: parseFloat(parsed[4]),
      bearing: parseFloat(parsed[5])
    }
    this.theMap.flyTo(options);
    console.log('RERE', options);
  }

}
