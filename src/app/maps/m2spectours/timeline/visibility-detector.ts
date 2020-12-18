import { Observable, Subject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

export class VisibilityDetector  {

    visible$ = new Subject<boolean>();
    visible: Observable<boolean>;
    observer: IntersectionObserver;
  
    constructor() {
      this.visible = this.visible$.pipe(
        distinctUntilChanged()
      );
      this.visible$.next(false);
    }

    initVisibilityDetector(element, rootElement) {
        // (this.el.nativeElement as HTMLElement).parentElement
        const observerOptions = {
            root: rootElement,
            rootMargin: '-50% 0% -50% 0%',
            threshold: 0
          }
          this.observer = new IntersectionObserver((entries) => {
            this.visible$.next(entries[0].isIntersecting);
          }, observerOptions);
          this.observer.observe(element);      
    }

}
