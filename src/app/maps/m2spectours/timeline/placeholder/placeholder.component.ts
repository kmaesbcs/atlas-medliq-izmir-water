import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { VisibilityDetector } from '../visibility-detector';

@Component({
  selector: 'app-spectours-timeline-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.less']
})
export class PlaceholderComponent extends VisibilityDetector implements OnInit, AfterViewInit {

  @Input() item;
  active = false;

  constructor(private el: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.visible.subscribe((visible) => {
      this.active = visible;
    });
  }

  ngAfterViewInit() {
    const el: HTMLElement = this.el.nativeElement;
    this.initVisibilityDetector(el, el.parentElement);
  }

}
