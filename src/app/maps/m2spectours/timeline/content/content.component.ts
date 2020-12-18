import { ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { VisibilityDetector } from '../visibility-detector';

@Component({
  selector: 'app-spectours-timeline-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.less']
})
export class ContentComponent extends VisibilityDetector implements OnInit, AfterViewInit {

  @Input() item;
  @Output() mapView = new EventEmitter<any>();

  constructor(private el: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.visible.subscribe((visible) => {
      console.log('CONTENT', visible, this.item);
      if (visible) {
        this.handleGeo();
      }
    });
  }

  ngAfterViewInit() {
    const el: HTMLElement = this.el.nativeElement;
    this.initVisibilityDetector(el, el.parentElement);
  }

  handleGeo() {
    let mapView = null;
    for (const content of this.item.content) {
      if (content.map_view && content.map_view.length) {
        mapView = content.map_view[0];
        this.mapView.next(mapView);
        break;
      }
    }

  }
}