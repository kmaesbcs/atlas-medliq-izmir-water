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
export class SpecToursComponent {

  constructor(public api: SpecToursService) {}

}
