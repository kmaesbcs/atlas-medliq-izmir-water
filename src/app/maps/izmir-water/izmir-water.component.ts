import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

import { IzmirWaterDataService } from './izmir-water.data.service';
import { IzmirWaterLanguageService } from './izmir-water.language.service';
import { IzmirWaterMapboxHelperService } from './izmir-water.mapbox.helper.service';
import { delay, first, switchMap } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { IzmirWaterMapService } from './izmir-water.map.service';
import { IzmirWaterEventManagerService } from './izmir-water.eventmanager.service';

@Component({
  selector: 'app-izmir-water',
  templateUrl: './izmir-water.component.html',
  styleUrls: ['./izmir-water.component.less'],
})
export class IzmirWaterComponent implements OnInit, AfterViewInit {
  @ViewChild('mapEl', { static: true }) mapEl: ElementRef;

  selectedLanguageOption;
  points = new ReplaySubject<GeoJSON.FeatureCollection>(1);
  _point = null;
  info = false;

  theMap: mapboxgl.Map;
  LAYER_NAME = 'izmir-water';
  HIGHLIGHTS = 'highlighted';
  SOURCE_NAME = 'samples';

  mapCentre = [27.1370, 38.4161];
  karantinaPosition = [27.14227, 38.43894];
  karantinaIconPosition = [27.140, 38.4227];
  returnToIzmirMarkerPosition = [27.1422, 38.4386];
  karantinaZoom = 18.1;
  karantinaPitch = 50;
  standardZoom = 15.5;
  standardPitch = 50;


  DUMMY = { name: '', description: '', attachment: '' };

  constructor(
    private elRef: ElementRef,
    private dataApi: IzmirWaterDataService,
    private activatedRoute: ActivatedRoute,
    private map: IzmirWaterMapService,
    private languageApi : IzmirWaterLanguageService,
    private mapboxHelper : IzmirWaterMapboxHelperService,
    private eventManager : IzmirWaterEventManagerService
  ) {

    this.eventManager.languageChanged.subscribe(
      (selection: string) => {
        this.selectedLanguageOption = selection;
      }
    );

    dataApi
      .getPoints()
      .pipe(
        switchMap((points) => {
          this.points.next(points);
          return this.activatedRoute.fragment;
        }),
        first(),
        delay(100)
      )
      .subscribe((fragment) => {
        this.points.pipe(first()).subscribe((points) => {
          points.features.forEach((s: any) => {
            const props = s.properties;
            if (props.id === fragment) {
              this.point = props;
            }
          });
        });
      });
  }

  ngAfterViewInit() {}

  set point(value) {
    this.languageApi.setMainLanguageOptions(value, this.selectedLanguageOption);
    this._point = value;
    if (value) {
      this.setHighlight(value.id);
      location.hash = '#' + value.id;
    } else {
      this.setHighlight('__non_existent__');
      location.hash = '';
    }
  }

  get point() {
    return this._point;
  }

  ngOnInit(): void {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: 'mapbox://styles/kmaes/cloj8rk2h002o01nza5b9dhck',
      minZoom: 14,
      center: [this.mapCentre[0], this.mapCentre[1]],
      zoom: this.standardZoom,
      pitch: this.standardPitch
    });
    let selectedPoint;
    let currentMarker;

    new mapboxgl.Marker({
      element: this.mapboxHelper.karantinaIcon(this.theMap, this.karantinaPosition, this.karantinaZoom, this.karantinaPitch)
    })
    .setLngLat([this.karantinaIconPosition[0], this.karantinaIconPosition[1]])
    .addTo(this.theMap);

    new mapboxgl.Marker({
      element: this.mapboxHelper.returnToIzmirMarker(this.theMap, this.mapCentre, this.standardZoom, this.standardPitch)
    })
    .setLngLat([this.returnToIzmirMarkerPosition[0], this.returnToIzmirMarkerPosition[1]])
    .addTo(this.theMap);

    this.theMap.on('style.load', () => {
      this.points
        .pipe(first())
        .subscribe((points: GeoJSON.FeatureCollection) => {
          this.theMap.addSource(this.SOURCE_NAME, {
            type: 'geojson',
            data: points,
          });
          this.map.setLayerSource(
            this.theMap,
            this.LAYER_NAME,
            this.SOURCE_NAME
          );
          this.map.setLayerSource(
            this.theMap,
            this.HIGHLIGHTS,
            this.SOURCE_NAME
          );
          this.setHighlight('__non_existent__');
          this.theMap.on('mouseenter', this.LAYER_NAME, () => {
            this.theMap.getCanvas().style.cursor = 'pointer';
          });
          this.theMap.on('mouseleave', this.LAYER_NAME, () => {
            this.theMap.getCanvas().style.cursor = '';
          });
          this.theMap.on('click', () => {
            if (selectedPoint) {
              currentMarker.remove();
            }
          });
          this.theMap.on('click', this.LAYER_NAME, (e) => {
            const coordinates = e.features[0].properties.Coordinates.split(',');

            if (selectedPoint) {
              currentMarker.remove();
            }
            selectedPoint = e.features[0].properties;
            
            const imageUrl = this.languageApi.getFirstImageUrlFromBlob(selectedPoint.Attachments);
            const datePeriod = this.languageApi.getFirstDatePeriodFromBlob(selectedPoint, this.selectedLanguageOption)

            currentMarker = new mapboxgl.Marker({
              element: this.mapboxHelper.createBlankMarkerElement(
                this.languageApi.getNameByLanguage(selectedPoint, this.selectedLanguageOption),
                datePeriod,
                imageUrl
              ),
              anchor: 'bottom',
            })
              .setLngLat([coordinates[1] + 5, coordinates[0] + 5])
              .addTo(this.theMap);

            document
              .getElementById('currentSelectedMarker')
              .addEventListener('click', () => {
                this.point = selectedPoint;
                this.info = false;
                location.hash = '#' + this.point.id;
              });
          });
        });
    });
  }

  setHighlight(id) {
    if (this.theMap) {
      this.theMap.setFilter(this.HIGHLIGHTS, [
        'match',
        ['get', 'id'],
        [id],
        true,
        false,
      ]);
    }
  }
}
