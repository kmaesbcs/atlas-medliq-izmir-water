import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { TroubledwatersService } from '../troubledwaters.service';

import { Scroller } from '../scroller';
import { AnimationManagerService } from 'src/app/animation-manager.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-troubledwaters-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.less']
})
export class TroubledwatersTimelineComponent implements OnInit, AfterViewInit {

  segments: any[] = [];
  init = new ReplaySubject<void>(1);
  scroller: Scroller = null;

  @ViewChild('timeline', {static: true}) timeline: ElementRef;

  constructor(private troubledWaters: TroubledwatersService, private router: Router, 
              private animationManager: AnimationManagerService) { }

  ngOnInit(): void {
    this.troubledWaters.data.pipe(first()).subscribe((segments) => {
      for (const segment of segments) {
        const item = {
          id: segment.id,
          src: segment,
          sections: [],
          played: {},
        };
        for (let section_idx = 0; section_idx < (segment.audio_timestamps || []).length; section_idx++) {
          const timestamp = segment.audio_timestamps[section_idx];
          const next_timestamp = segment.audio_timestamps[section_idx + 1];
          const start = Math.floor(timestamp.timestamp/10);
          const end = next_timestamp ? Math.floor(next_timestamp.timestamp/10) : segment.duration;
          const item1 = {
            id: timestamp.id,
            seconds: []
          }
          for (let sec = start; sec < end; sec++) {
            item1.seconds.push(sec)
          }
          if (item1.seconds.length > 0) {
            item.sections.push(item1);
          }
        }
        this.segments.push(item);
      }
      this.init.next();
    });
  }

  ngAfterViewInit() {
    this.init.pipe(first(), delay(0)).subscribe(() => {
      this.troubledWaters.position.subscribe(({segment, timestamp, offset}) => {
        if (!this.timeline || !this.timeline.nativeElement) {
          return;
        }
        const second = Math.floor(offset/10);
        const el = this.timeline.nativeElement as HTMLElement;
        const firstSelector = `.segment[data-segment="${this.segments[0].id}"]`;
        const secondSelector = `.segment[data-segment="${segment.id}"] > .section[data-section="${timestamp.id}"] > .second[data-second="${second}"]`;
        const outer = el.querySelector(firstSelector);
        const inner = el.querySelector(secondSelector);
        if (inner) {
          const scrollOffset = inner.getBoundingClientRect().top - outer.getBoundingClientRect().top + 2;
          if (!this.scroller) {
            this.scroller = new Scroller(el, '.second', this.animationManager);
          }
          this.scroller.update(scrollOffset);
        }
        if (this.troubledWaters.playing) {
          // this.segments.filter(x => x.id === segment.id)[0].played[offset] = true;
          if (second > 0) {
            this.segments.filter(x => x.id === segment.id)[0].played[second - 1] = true;
          }
        }  
      });
    });
  }

  played(segment, offset) {
    return segment.played && segment.played[offset];
  }

  // transform() {
  //   const offset = `calc(50% + (${this.offset}px))`; 
  //   return `translateY(${offset})`;
  // }

  bgStyle(segment, offset) {
    if (this.played(segment, offset)) {
      return {'background-image': `linear-gradient(${segment.src.interviewee.color} 100%,transparent 0%)`};
    } else {
      return {'background-image': `linear-gradient(${segment.src.interviewee.color} 50%,transparent 0%)`};
    }    
  }

  secondClicked(segment, offset) {
    this.router.navigate(['m3'], {queryParams: {segment: segment.id, offset: offset * 10, who: 'second-click'}});
  }
}
