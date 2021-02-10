import { debounceTime, filter, sampleTime, tap } from 'rxjs/operators';
import { fromEvent, Subscription } from 'rxjs';
import { AnimationManagerService } from '../../animation-manager.service';
import { LayoutService } from 'src/app/layout.service';

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
    duration = 1000;
    mmSub: Subscription;
  
    constructor(private el: HTMLElement, private itemSelector, private animationManager: AnimationManagerService,
                private horizontal: () => boolean) {
      let wheelTimer = null;
      this.prefix = `scroller:${itemSelector}:`;
      this.duration = horizontal() ? 500 : 1000;
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

      if (!horizontal()) {
        // Mouse up/down Event
        fromEvent(el, 'mousedown').subscribe((ev: MouseEvent) => {
          if (ev.button === 0) {
            this.dragDiff = this.scrollTop + this.eventCoord(ev);
            this.dragStart = performance.now();
            this.dragging = true;
            if (this.mmSub) {
              this.mmSub.unsubscribe();
            }
            this.mmSub = fromEvent(el, 'mousemove').subscribe((ev: MouseEvent) => {
              if (this.dragging) {
                animationManager.register(this.prefix + 'mousemove', () => {
                  this.el.scrollTo(this.scrollToOptions(
                    -this.eventCoord(ev) + this.dragDiff
                  ));
                  animationManager.deregister(this.prefix + 'mousemove');
                });
                animationManager.enable(this.prefix + 'mousemove');
                animationManager.go();
              }
            });    
          }
        });
        fromEvent(el, 'mouseup').subscribe(() => {
          const now = performance.now();
          if (this.dragging && now - this.dragStart > 200) {
            this.scrollEnded();  
          }
          this.dragging = false;
          if (this.mmSub) {
            this.mmSub.unsubscribe();
            this.mmSub = null;
          }
        });

        // Mouse Move Event
      }

      // Smooth Scroll
      this.animationManager.register(this.prefix + 'smoothscroll', (x) => this.scrollSmoothly(x));
    }
  
    scrollEnded() {
      const center = this.horizontal() ? this.el.offsetWidth / 2 : this.el.offsetHeight / 2;;
      let selected: HTMLElement = null;
      let nearest = center;
      this.el.querySelectorAll(this.itemSelector).forEach((second: HTMLElement) => {
        const rect = second.getBoundingClientRect();
        const dist = this.horizontal() ? 
          Math.abs(rect.left + rect.width/2 - center) :
          Math.abs(rect.top + rect.height/2 - center);
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
      if (timestamp - this.startingTime <= this.duration) {
        let target = this.startingOffset + (this.offset - this.startingOffset) * (timestamp - this.startingTime) / this.duration;
        target = Math.ceil(target);
        if (Math.abs(target - this.scrollTop) > 0) {
          if (!this.scrolling && !this.dragging) {
            this.el.scrollTo(this.scrollToOptions(target, 'auto'));  
          }
        }
        this.animationManager.go();
      } else {
        if (Math.abs(this.offset - this.scrollTop) > 0) {
          if (!this.scrolling && !this.dragging) {
            this.el.scrollTo(this.scrollToOptions(this.offset, 'auto'));
          }
        }
        this.animationManager.disable(this.prefix + 'smoothscroll');
        this.done = true;
      }
    }
  
    update(offset, force=false) {
      if (this.scrollTop === offset && !force) {
        return;
      }
      this.offset = offset;
      this.startingTime = performance.now();
      this.startingOffset = this.scrollTop;
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
  
    get scrollTop() {
      return this.horizontal() ? this.el.scrollLeft : this.el.scrollTop;
    }

    eventCoord(ev) {
      return this.horizontal() ? ev.x : ev.y;
    }

    scrollToOptions(ofs: number, behavior: ScrollBehavior = 'auto'): ScrollToOptions {
      return this.horizontal() ? 
        {left: ofs, behavior: behavior} : 
        {top: ofs, behavior: behavior};
    }

  }
  