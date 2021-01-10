import { debounceTime, filter, sampleTime, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

export class Scroller {
  
    startingOffset = 0;
    startingTime = 0;
    offset = 0;
    _done = true;
    _dragging = false;
    dragDiff = 0;
    _scrolling = false;
  
    constructor(private el: HTMLElement, private itemSelector) {
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
      fromEvent(el, 'mouseup').subscribe(() => {
        if (this.dragging) {
          this.dragging = false;
          this.scrollEnded();  
        }
      });
      fromEvent(el, 'mousemove').pipe(
        filter(() => this.dragging),
        // sampleTime(),
        tap((ev: MouseEvent) => {
          this.el.scrollTo({top: - ev.y + this.dragDiff});
        }),
        debounceTime(1000),
      ).subscribe(() => {
        this.dragging = false;
        // this.scrollEnded();
      });
    }
  
    scrollEnded() {
      const center = this.el.getBoundingClientRect().height / 2;
      let selected: HTMLElement = null;
      let last: HTMLElement = null;
      this.el.querySelectorAll(this.itemSelector).forEach((second: HTMLElement) => {
        if (selected === null && second.getBoundingClientRect().top > center) {
          selected = last || second;
        }
        last = second;
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
      if (this.el.scrollTop === offset) {
        return;
      }
      this.offset = offset;
      this.startingTime = performance.now();
      this.startingOffset = this.el.scrollTop;
      if (this.done) {
        this.done = false;
        requestAnimationFrame((x) => this.scrollSmoothly(x));
      }
    }

    get done() {
      return this._done;
    }

    get scrolling() {
      return this._scrolling;
    }

    get dragging() {
      return this._dragging;
    }

    set done(value) {
      if (this._done === value) {
        return;
      }
      console.log('SSS', this.itemSelector, 'DONE', value);
      this._done = value;
    }
  
    set scrolling(value) {
      if (this._scrolling === value) {
        return;
      }
      console.log('SSS', this.itemSelector, 'SCROLLING', value);
      this._scrolling = value;
    }
  
    set dragging(value) {
      if (this._dragging === value) {
        return;
      }
      console.log('SSS', this.itemSelector, 'DRAGGING', value);
      this._dragging = value;
    }
  
  }
  