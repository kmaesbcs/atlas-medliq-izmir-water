import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SpecToursService } from '../spectours.service';

import * as marked from 'marked'

@Component({
  selector: 'app-spectours-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class SpectoursInfobarComponent implements OnInit {

  @Output() close = new EventEmitter();
  
  marked = marked;

  constructor(public spectours: SpecToursService) { }

  ngOnInit(): void {
  }

}
