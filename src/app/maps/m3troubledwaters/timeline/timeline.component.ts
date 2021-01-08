import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, ReplaySubject } from 'rxjs';
import { debounceTime, delay, filter, first, sampleTime, tap } from 'rxjs/operators';
import { TroubledwatersService } from '../troubledwaters.service';


class Scroller {
  
  startingOffset = 0;
  startingTime = 0;
  offset = 0;
  done = true;
  dragging = false;
  dragDiff = 0;
  scrolling = false;

  constructor(private el: HTMLElement) {
    fromEvent(el, 'wheel').pipe(
      tap(() => { this.scrolling = true; }),
      debounceTime(500)
    ).subscribe(() => {
      this.scrolling = false;
      this.scrollEnded();
    });
    fromEvent(el, 'mousedown').subscribe((ev: MouseEvent) => {
      this.dragDiff = this.el.scrollTop + ev.y;
      this.dragging = true;
    });
    fromEvent(el, 'mouseup').subscribe(() => { this.dragging = false; });
    fromEvent(el, 'mousemove').pipe(
      filter(() => this.dragging),
      sampleTime(33),
      tap((ev: MouseEvent) => {
        this.el.scrollTo({top: - ev.y + this.dragDiff});
      }),
      debounceTime(500),
    ).subscribe(() => {
      this.dragging = false;
      this.scrollEnded();
    });
  }

  scrollEnded() {
    const center = this.el.getBoundingClientRect().height / 2;
    let selected: HTMLElement = null;
    this.el.querySelectorAll('.second').forEach((second) => {
      if (selected === null && second.getBoundingClientRect().top > center) {
        selected = second as HTMLElement;
      }
    });
    if (selected !== null) {
      selected.click();
    }
  }

  scrollSmoothly(timestamp) {
    if (this.done) {
      return;
    }
    if (timestamp - this.startingTime <= 1000) {
      let target = this.startingOffset + (this.offset - this.startingOffset) * (timestamp - this.startingTime) / 1000;
      target = Math.ceil(target);
      if (Math.abs(target - this.el.scrollTop) > 0) {
        if (!this.scrolling && !this.dragging) {
          this.el.scrollTo({top: target, behavior: 'auto'});  
        }
      }
      requestAnimationFrame((x) => this.scrollSmoothly(x)); 
    } else {
      if (Math.abs(this.offset - this.el.scrollTop) > 0) {
        if (!this.scrolling && !this.dragging) {
          this.el.scrollTo({top: this.offset, behavior: 'auto'});
        }
      }
      this.done = true;
    }
  }

  update(offset) {
    this.offset = offset;
    this.startingTime = performance.now();
    this.startingOffset = this.el.scrollTop;
    if (this.done) {
      this.done = false;
      requestAnimationFrame((x) => this.scrollSmoothly(x));
    }
  }

}

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
        const firstSelector = `.segment:nth-child(2)`;
        const secondSelector = `.segment[data-segment="${segment.id}"] > .section[data-section="${timestamp.id}"] > .second[data-offset="${offset}"]`;
        const outer = el.querySelector(firstSelector);
        const inner = el.querySelector(secondSelector);
        if (inner) {
          const offset = inner.getBoundingClientRect().top - outer.getBoundingClientRect().top + 2;
          if (!this.scroller) {
            this.scroller = new Scroller(el);
          }
          this.scroller.update(offset);
        }
        if (this.troubledWaters.playing) {
          // this.segments.filter(x => x.id === segment.id)[0].played[offset] = true;
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

  // transform() {
  //   const offset = `calc(50% + (${this.offset}px))`; 
  //   return `translateY(${offset})`;
  // }

  bgStyle(segment, offset) {
    if (this.played(segment, offset)) {
      return segment.src.interviewee.color;
    } else {
      return `linear-gradient(${segment.src.interviewee.color} 50%,transparent 0%)`;
    }    
  }
}
