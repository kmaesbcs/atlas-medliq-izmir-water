import { debounceTime, filter, sampleTime, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { AnimationManagerService } from '../../animation-manager.service';

export class Scroller {
  
    startingOffset = 0;
    startingTime = 0;
    offset = 0;
    _done = true;
    _dragging = false;
    dragDiff = 0;
    dragStart = 0;
    _scrolling = false;
    prefix = '';
  
    constructor(private el: HTMLElement, private itemSelector, private animationManager: AnimationManagerService) {
      let wheelTimer = null;
      this.prefix = `scroller:${itemSelector}:`;

      // Wheel Event
      animationManager.register(this.prefix + 'wheel', () => {
        this.scrolling = true;
        if (wheelTimer !== null) {
          clearTimeout(wheelTimer);
        }
        wheelTimer = setTimeout(() => {
          this.scrolling = false;
          animationManager.disable(this.prefix + 'wheel');
          this.scrollEnded();
        }, 500);
        animationManager.disable(this.prefix + 'wheel')
      });  
      fromEvent(el, 'wheel').subscribe(() => {
        animationManager.enable(this.prefix + 'wheel')
        animationManager.go();
      });

      // Mouse up/down Event
      fromEvent(el, 'mousedown').subscribe((ev: MouseEvent) => {
        this.dragDiff = this.el.scrollTop + ev.y;
        this.dragStart = performance.now();
        this.dragging = true;
      });
      fromEvent(el, 'mouseup').subscribe(() => {
        const now = performance.now();
        this.dragging = false;
        if (this.dragging && now - this.dragStart > 200) {
          this.scrollEnded();  
        }
      });

      // Mouse Move Event
      fromEvent(el, 'mousemove').subscribe((ev: MouseEvent) => {
        if (this.dragging) {
          animationManager.register(this.prefix + 'mousemove', () => {
            this.el.scrollTo({top: - ev.y + this.dragDiff});
            animationManager.deregister(this.prefix + 'mousemove');
          });
        }
        animationManager.go();
      });

      // Smooth Scroll
      this.animationManager.register(this.prefix + 'smoothscroll', (x) => this.scrollSmoothly(x));
      this.animationManager.disable(this.prefix + 'smoothscroll');
    }
  
    scrollEnded() {
      const center = this.el.offsetHeight / 2;
      let selected: HTMLElement = null;
      let nearest = center;
      this.el.querySelectorAll(this.itemSelector).forEach((second: HTMLElement) => {
        const rect = second.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height/2 - center);
        if (selected === null || dist < nearest) {
          selected = second;
          nearest = dist;
        }
      });
      if (selected !== null) {
        selected.click();
        const offset = selected.getAttribute('data-offset');
        if (offset) {
          this.update(parseInt(offset, 10));
        }
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
        this.animationManager.go();
      } else {
        if (Math.abs(this.offset - this.el.scrollTop) > 0) {
          if (!this.scrolling && !this.dragging) {
            this.el.scrollTo({top: this.offset, behavior: 'auto'});
          }
        }
        this.animationManager.disable(this.prefix + 'smoothscroll');
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
        this.animationManager.enable(this.prefix + 'smoothscroll');
        this.animationManager.go();
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
      this._done = value;
    }
  
    set scrolling(value) {
      if (this._scrolling === value) {
        return;
      }
      this._scrolling = value;
    }
  
    set dragging(value) {
      if (this._dragging === value) {
        return;
      }
      this._dragging = value;
    }
  
  }
  