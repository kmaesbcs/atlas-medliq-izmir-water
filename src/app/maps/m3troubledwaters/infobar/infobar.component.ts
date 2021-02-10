import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TroubledwatersService } from '../troubledwaters.service';

import * as marked from 'marked';

@Component({
  selector: 'app-troubledwaters-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class InfobarComponent implements OnInit {

  @Output() close = new EventEmitter();

  marked = marked;

  constructor(public troubledWaters: TroubledwatersService) { }

  ngOnInit(): void {
  }

}
