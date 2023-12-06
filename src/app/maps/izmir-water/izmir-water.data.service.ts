import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FeatureCollection, Feature, Geometry } from 'geojson';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IzmirWaterDataService {

  BASE = 'appd3nk3h0MF2zWEu';
  details = new ReplaySubject<any>(1);
  aboutInfo = new ReplaySubject<any[]>(1);
  TITLE = '';
  SUBTITLE = '';
  ABOUT = '';
  MIN_ZOOM = 0

  API_KEY = 'patAENQ1nDZjq0zTb.c9de03cc43703f4724edffb5d57e062f79266b3ad4408c2379f210e7e5c6d7d4';
  AIRTABLE_BASE = 'https://api.airtable.com/v0';
  
  constructor(private http: HttpClient) { 
    this.getDetails();
  }

  getPoints() {
    
    return this.airtableFetch(this.BASE, 'PointsOfInterest').pipe(
      map((response: any) => response.records.map((rec) => {
        return Object.assign(rec.fields, {id: rec.id});
      })),
      map((points: any[]) => { 
        return {
          type: 'FeatureCollection',
          features: points.map((point) => {
            
            const s = point.Coordinates;
            const coordinates = s.split(',').map((x) => parseFloat(x));
            
            return {
              type: 'Feature',
              properties: point,
              geometry: {
                type: 'Point',
                coordinates: [coordinates[1], coordinates[0]]
              } as Geometry
            } as Feature;
          })
        } as FeatureCollection;
      })
    );
  }

  getDetails() {
    this.airtableFetch(this.BASE, 'Images')
      .pipe(
        this.airtableToMapping(),
      ).subscribe((details) => {
        this.details.next(details);
      });
  }

  getAboutUsInfo(): Observable<any[]> {
    return this.airtableFetch(this.BASE, 'ABOUT').pipe(
        map((response: any) => {
            return response.records.map((rec) => {
                return Object.assign(rec.fields, {id: rec.id});
            });
        })
    );
  }

  airtableFetch(base, table, record?, fields?) {

    let url = `${this.AIRTABLE_BASE}/${base}/${table}`;
    let params: any = {};
    if (record) {
      url += `/${record}`;
    } else {
      params = {
        maxRecords: 1000
      };
      if (fields) {
        params.fields = fields;
      }
    }

    const headers = {
      Authorization: `Bearer ${this.API_KEY}`
    };

    return this.http.get(
      url, {headers, params}
    );  
  }

  airtableToMapping() {
    return map((response: any) => {
      const ret = {};
      response.records.forEach((i) => {
        ret[i.id] = Object.assign(i.fields, {id: i.id});
      });
      return ret;
    });
  }

  sanitizeBlob(s: string) {
    if (s == null) return '';
    return s = s.replace(/[\['"\]]+/g, '') as any;
  }
}