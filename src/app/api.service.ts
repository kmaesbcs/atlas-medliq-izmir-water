import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  API_KEY = 'patU6EhqmETwydOrK.30f97ce7ff8af71f555e5d1af3b715669601f712b17ce5dafd8b60494527dd56';
  AIRTABLE_BASE = 'https://api.airtable.com/v0';
  
  constructor(private http: HttpClient) { }

  airtableToMapping() {
    return map((response: any) => {
      const ret = {};
      response.records.forEach((i) => {
        ret[i.id] = Object.assign(i.fields, {id: i.id});
      });
      return ret;
    });
  }

  airtableToArray() {
    return map((response: any) => {
      const ret = response.records.map((i) => i.fields);
      return ret;
    });
  }

  airtableFetch(base, table, view, record?, fields?) {
    const headers = {
      Authorization: `Bearer ${this.API_KEY}`
    };
    let url = `${this.AIRTABLE_BASE}/${base}/${table}`;
    let params: any = {};
    if (record) {
      url += `/${record}`;
    } else {
      params = {
        maxRecords: 1000,
        view,
      };
      if (fields) {
        params.fields = fields;
      }
    }
    return this.http.get(
      url, {headers, params}
    );  
  }
}
