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

  fetchData() {
    return from([true]).pipe(
      switchMap(() => {
        return forkJoin([
          this.fetchMapViews(),
          this.fetchContent(),
          this.fetchTimeline(),
        ]);
      }),
      map(([mapViews, content, timeline]) => {
        for (const item of Object.values(content) as any[]) {
          if (item.map_view) {
            item.map_view = item.map_view.map((mv) => mapViews[mv]);
          }
        }
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
