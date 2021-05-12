import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { MapService } from 'src/app/map.service';
import { TimelineMapService } from '../../templates/timeline/timeline-map-service';

@Injectable({
  providedIn: 'root'
})
export class SpecToursService extends TimelineMapService {

  constructor(api: ApiService, map: MapService) {
    super(api, map, 'appk4QxOhg2XleeTM');
  }

}
