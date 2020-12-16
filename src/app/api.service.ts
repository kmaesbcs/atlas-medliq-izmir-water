import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FeatureCollection, Feature, Geometry } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  API_KEY = 'key7jIbxK4zBiOYDr';
  AIRTABLE_BASE = 'https://api.airtable.com/v0';
  
  M1 = 'app4j8ReBz6mg40Al';
  M2 = 'appk4QxOhg2XleeTM';
  M3 = ''

  constructor(private http: HttpClient) { }

  airtableFetch(base, table, view, record?) {
    const headers = {
      Authorization: `Bearer ${this.API_KEY}`
    };
    let url = `${this.AIRTABLE_BASE}/${base}/${table}`;
    let params = {};
    if (record) {
      url += `/${record}`;
    } else {
      params = {
        maxRecords: 1000,
        view: view
      };
    }
    return this.http.get(
      url, {headers, params}
    );
  }

  m1GetSamples() {
    return this.airtableFetch(this.M1, 'Samples', 'website')
        .pipe(
          map((response: any) => response.records.map((rec) => rec.fields)),
          map((samples: any[]) => { 
            return {
              type: 'FeatureCollection',
              features: samples.map((sample) => {
                const coordinates = sample.coordinates.split(',').map((x) => parseFloat(x));
                sample.symbol = (
                  (sample.audio_above && sample.audio_above.length) ? '' : 'no'
                ) + 'above+' + (
                  (sample.audio_below && sample.audio_below.length) ? '' : 'no'
                ) + 'below';
                sample.image_above = sample.image_above ? sample.image_above[0].thumbnails.large.url: '';
                sample.image_below = sample.image_below ? sample.image_below[0].thumbnails.large.url: '';
                sample.audio_above = sample.audio_above ? sample.audio_above[0].url: '';
                sample.audio_below = sample.audio_below ? sample.audio_below[0].url: '';
                return {
                  type: 'Feature',
                  properties: sample,
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
}
