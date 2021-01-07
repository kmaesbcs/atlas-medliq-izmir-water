import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { TroubledwatersService } from '../troubledwaters.service';

@Component({
  selector: 'app-troubledwaters-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.less']
})
export class TroubledwatersTimelineComponent implements OnInit {

  segments: any[] = [];

  constructor(private troubledWaters: TroubledwatersService) { }

  ngOnInit(): void {
    this.troubledWaters.data.pipe(first()).subscribe((segments) => {

    });
  }

}
