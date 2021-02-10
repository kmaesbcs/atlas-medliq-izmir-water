import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { ReplaySubject } from 'rxjs';
import { delay, first, switchMap } from 'rxjs/operators';
import { MapService } from 'src/app/map.service';

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
  _info = false;
  activeYear = -1;

  constructor(private api: SpecToursService, private activatedRoute: ActivatedRoute, private mapSvc: MapService) {
    api.fetchData().pipe(
      switchMap((timeline) => {
        this.timeline = timeline;
        return this.activatedRoute.fragment;
      }),
      first(),
      delay(1000),
    ).subscribe((fragment) => {
      this.activeYear = api.YEAR_CURRENT;
      if (fragment ) {
        this.activeYear = parseInt(fragment.slice(1));
        if (!this.activeYear) {
          this.activeYear = api.YEAR_CURRENT;
        }
      }
      fragment = 'Y' + this.activeYear;
      const el = document.querySelector(`[data-year=${fragment}]`);
      if (el) {
        el.scrollIntoView({block: 'center', behavior: 'auto'});
      }
    });
    this._info = localStorage.getItem('M2') !== 'opened';
  }

  get info() { return this._info; }
  set info(value) {
    this._info = value;
    localStorage.setItem('M2', 'opened');
  }

  ngOnInit(): void {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: 'mapbox://styles/atlasmedliq/ckiodibg82x1k17tcof8e9pmd',
      minZoom: 3,
    });
    this.theMap.on('style.load', () => {
      this.api.fetchMapData().subscribe((views) => {
        this.mapViews.next(views);
      });  
    })
  }

  changeMapView(mapView) {
    this.mapViews.pipe(first()).subscribe((mapViews) => {
      mapView = mapViews[mapView];
      const options = this.mapSvc.parseMapView(mapView);
      for (const l of mapView.onLayers) {
        if (this.theMap.getLayer(l)) {
          this.theMap.setLayoutProperty(l, 'visibility', 'visible');
        }
      }
      for (const l of mapView.offLayers) {
        if (this.theMap.getLayer(l)) {
          this.theMap.setLayoutProperty(l, 'visibility', 'none');
        }
      }
      this.theMap.flyTo(options);
    });
  }

}
