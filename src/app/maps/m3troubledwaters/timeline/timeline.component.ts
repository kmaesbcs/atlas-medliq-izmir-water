import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { TroubledwatersService } from '../troubledwaters.service';

@Component({
  selector: 'app-troubledwaters-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.less']
})
export class TroubledwatersTimelineComponent implements OnInit, AfterViewInit {

  segments: any[] = [];
  init = new ReplaySubject<void>(1);
  offset = 0;
  @ViewChild('timeline', {static: true}) timeline: ElementRef;

  constructor(private troubledWaters: TroubledwatersService, private sanitizer: DomSanitizer) { }

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
          const start = timestamp.timestamp;
          const end = next_timestamp ? next_timestamp.timestamp : segment.duration;
          const item1 = {
            id: timestamp.id,
            seconds: []
          }
          for (let sec = start; sec < end; sec++) {
            item1.seconds.push(sec)
          }
          item.sections.push(item1);
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
        const el = this.timeline.nativeElement as HTMLElement;
        const firstSelector = `.segment:first-child`;
        const secondSelector = `.segment[data-segment="${segment.id}"] > .section[data-section="${timestamp.id}"] > .second[data-offset="${offset}"]`;
        const outer = el.querySelector(firstSelector);
        const inner = el.querySelector(secondSelector);
        if (inner) {
          this.offset = outer.getBoundingClientRect().top - inner.getBoundingClientRect().top;
        }
        if (this.troubledWaters.playing) {
          this.segments.filter(x => x.id === segment.id)[0].played[offset] = true;
          if (offset > 0) {
            this.segments.filter(x => x.id === segment.id)[0].played[offset - 1] = true;
          }
        }  
      });
    });
  }

  played(segment, offset) {
    return segment.played && segment.played[offset];
  }

  transform() {
    const offset = `calc(50% + (${this.offset}px))`; 
    return `translateY(${offset})`;
  }

  bgStyle(segment, offset) {
    if (this.played(segment, offset)) {
      return segment.src.interviewee.color;
    } else {
      return `linear-gradient(${segment.src.interviewee.color} 50%,transparent 0%)`;
    }    
  }
}
