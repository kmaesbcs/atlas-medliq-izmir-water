import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { ReplaySubject } from 'rxjs';
import { delay, first, switchMap } from 'rxjs/operators';

import { SpecToursService } from './spectours.service';

@Component({
  selector: 'app-spectours',
  templateUrl: './spectours.component.html',
  styleUrls: ['./spectours.component.less']
})
export class SpecToursComponent implements OnInit {

  timeline = [];
  mapViews = new ReplaySubject<any>(1);
  theMap: mapboxgl.Map;
  @ViewChild('mapEl', {static: true}) mapEl: ElementRef;
  info = false;
  activeYear = -1;

  constructor(private api: SpecToursService, private activatedRoute: ActivatedRoute) {
    api.fetchData().pipe(
      switchMap((timeline) => {
        this.timeline = timeline;
        return this.activatedRoute.fragment;
      }),
      first(),
      delay(100),
    ).subscribe((fragment) => {
      const el = document.querySelector(`[data-year=${fragment}]`);
      if (el) {
        el.scrollIntoView({block: 'center', behavior: 'auto'});
      }
      if (fragment) {
        this.activeYear = parseInt(fragment.slice(1));
      }
      console.log('activeYear==', this.activeYear);
    });
    api.fetchMapData().subscribe((views) => {
      this.mapViews.next(views);
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
    this.mapViews.pipe(first()).subscribe((mapViews) => {
      mapView = mapViews[mapView];
      const geoRe = /center:\s*\{\s*lon:\s*([-0-9.]+),\s*lat:\s*([-0-9.]+)\s*\},\s*zoom:\s*([-0-9.]+),\s*pitch:\s*([-0-9.]+),\s*bearing:\s*([-0-9.]+)/g;
      const parsed = geoRe.exec(mapView.geo);
      const options: mapboxgl.FlyToOptions = {
        center: {
          lon: parseFloat(parsed[1]),
          lat: parseFloat(parsed[2]),
        },
        zoom: parseFloat(parsed[3]),
        pitch: parseFloat(parsed[4]),
        bearing: parseFloat(parsed[5])
      }
      if (mapView.curve) {
        options.curve = mapView.curve;
      }
      if (mapView.speed) {
        options.speed = mapView.speed;
      }
      for (const l of mapView.onLayers) {
        this.theMap.setLayoutProperty(l, 'visibility', 'visible');
      }
      for (const l of mapView.offLayers) {
        this.theMap.setLayoutProperty(l, 'visibility', 'none');
      }
      this.theMap.flyTo(options);
    });
  }

}
