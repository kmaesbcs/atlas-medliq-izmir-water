import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, fromEvent } from 'rxjs';
import { delay, first, map, tap } from 'rxjs/operators';
import { ApiService } from '../api.service';

import * as marked from 'marked';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.less']
})
export class MainPageComponent implements OnInit, OnDestroy {

  BASE = 'appDMYuX35cQbc97I';

  MAPS = [];
  MAPS_REVERSE = [];
  SETTINGS: any = {};

  marked = marked;
  active = -1;
  about = false;
  mobile = false;
  iobs: IntersectionObserver;

  constructor(private api: ApiService, private el: ElementRef, public layout: LayoutService) {
    forkJoin([
      api.airtableFetch(this.BASE, 'Maps', 'website', null, ['key', 'title', 'description', 'mobile', 'path']).pipe(api.airtableToArray()),
      api.airtableFetch(this.BASE, 'Settings', 'website', null, ['key', 'value']).pipe(api.airtableToArray())
    ]).pipe(
      first(),
      map(([maps, settings]) => {
        maps.forEach((el) => {
          el.mobile = !!el.mobile;
        });
        this.MAPS = maps;
        const _settings = {};
        settings.forEach(({key, value}) => {
          _settings[key] = value;
        })
        this.SETTINGS = _settings;
        this.MAPS.filter((v) => v.mobile).forEach((v, i) => { v.idx = i; });
        this.MAPS.filter((v) => !v.mobile).forEach((v, i) => { v.idx = i; });
        this.MAPS_REVERSE = this.MAPS.slice().reverse();
        console.log('MAPS', this.MAPS);
        console.log('SETTINGS', this.SETTINGS);
      }),
      delay(0),
      tap(() => {      
        this.initObserver();
      })
    ).subscribe(() => { console.log('INIT'); });

    this.mobile = this.layout.mobile();
    fromEvent(window, 'resize').subscribe(() => {
      this.mobile = this.layout.mobile();
    });
  }

  ngOnInit(): void {
  }

  initObserver() {
    const nel = (this.el.nativeElement as HTMLElement).querySelector('.viewport');
    // console.log('NEL', nel);
    this.iobs = new IntersectionObserver(
      (entries) => { this.intersection(entries); },
      {
        root: nel,
        threshold: 0.5,
        // rootMargin: '-50% 0% -50% 0%',
      }
    );
    nel.querySelectorAll('.slide').forEach((slide) => {
      // console.log('SLSL', slide);
      this.iobs.observe(slide);
    });
  }

  ngOnDestroy() {
    if (this.iobs) {
      this.iobs.disconnect();
      this.iobs = null;
    }
  }

  intersection(entries: IntersectionObserverEntry[]) {
    const intersecting = entries.filter((x) => x.isIntersecting);
    if (intersecting.length) {
      this.active = parseInt(intersecting[0].target.getAttribute('data-index'));
      this.about = false;
    }
    // console.log('intersection', intersecting.length, this.active);
  }

  mapTransformDesktop(i) {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const bottom = 256;
    const top = 72;
    const skip = 128;
    const map_height = 350;
    const map_width = 480;
    const padding = 50;
    const margin = 20;
    const skew = 0.7
    let indent = Math.min(
      (map_height / 2) * skew + padding,
      width / 2 - margin - map_width - (map_height / 2) * skew 
    );
    let move = 0;
    if (i > this.active) {
      move = bottom - (i - this.active - 1) * skip
    } else if (i == this.active) {
      move = height - map_height - top * 2;
    } else {
      move = height - top + (this.active - i - 1) * skip;
    }
    move = -move;
    return `translateY(${move}px)translateX(${indent}px)skew(35deg, 0deg)`;
  }

  mapTransformMobile(i) {
    const height = window.innerHeight;
    const bottom = 40;
    const top = 32;
    const skip = 64;
    let move = 0;
    if (i > this.active) {
      move = bottom - (i - this.active - 1) * skip
    } else if (i == this.active) {
      move = height / 2;
    } else {
      move = height - top + (this.active - i - 1) * skip;
    }
    move = -move;
    return `translateY(${move}px)skew(35deg, 0deg)`;
  }

  collaborations() {
    (this.el.nativeElement as HTMLElement).querySelector('.collaborations').scrollIntoView({block: 'start'});
  }

  aboutTitle() {
    (this.el.nativeElement as HTMLElement).querySelector('.about-title').scrollIntoView({block: 'start'});
  }
}
