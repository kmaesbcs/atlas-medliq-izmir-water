import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import { forkJoin, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/api.service';
import { MapService } from 'src/app/map.service';

@Injectable({
  providedIn: 'root'
})
export class SpecToursService {

  BASE = 'appk4QxOhg2XleeTM';
  YEAR_START = 1901;
  YEAR_END = 2100;

  constructor(private api: ApiService, private map: MapService) { }

  fetchAudioTimestamps() {
    return this.api.airtableFetch(this.BASE, 'AudioTimestamps', 'website').pipe(this.api.airtableToMapping());
  }
  
  fetchMapLayers() {
    return this.api.airtableFetch(this.BASE, 'MapLayers', 'website').pipe(this.api.airtableToMapping());
  }
  
  fetchMapViews() {
    return this.api.airtableFetch(this.BASE, 'MapViews', 'website').pipe(this.api.airtableToMapping());
  }

  fetchContent() {
    return this.api.airtableFetch(this.BASE, 'Content', 'website').pipe(this.api.airtableToMapping());
  }

  fetchTimeline() {
    return this.api.airtableFetch(this.BASE, 'Timeline', 'website').pipe(
      map((response: any) => response.records.map((i) => i.fields))
    );
  }

  fetchMapData() {
    return forkJoin([
      this.fetchMapLayers(),
      this.fetchMapViews(),
    ]).pipe(
      map(([layers, views]) => {
        const allLayers = new Set();
        Object.values(views).forEach((view: any) => {
          const onLayers = [];
          (view.map_layers || []).forEach((v) => {
            onLayers.push(...layers[v].on_layers);
          });
          onLayers.forEach(allLayers.add, allLayers);
          view.onLayers = onLayers;
        });
        Object.values(views).forEach((view: any) => {
          view.offLayers = [...allLayers].filter((l) => view.onLayers.indexOf(l) < 0);
        });
        return views;
      })
    );
  }

  fetchData() {
    return from([true]).pipe(
      switchMap(() => {
        return forkJoin([
          this.fetchAudioTimestamps(),
          this.fetchContent(),
          this.fetchTimeline(),
        ]);
      }),
      map(([audioTimestamps, content, timeline]) => {
        Object.values(content).forEach((item: any) => {
          if (item.audio_timestamps) {
            item.audio_timestamps = item.audio_timestamps.map((x) => audioTimestamps[x]);
          } else {
            item.audio_timestamps = []
          }
        });
        timeline.forEach(item => {
          item.content = item.content.map(id => content[id]);
          item.year = dayjs(item.date).year();
        });
        return (timeline as any[]).sort((a, b) => a.year - b.year);
      }),
      map((timeline) => {
        const ret = [];
        const content = [];
        for (let year = this.YEAR_START; year <= this.YEAR_END; year++) {
          if (timeline.length > 0) {
            if (timeline[0].year === year) {
              ret.push(timeline.shift());
              continue;
            }
          }
          ret.push({year, content});
        }
        return ret;
      })
    );
  }
}
