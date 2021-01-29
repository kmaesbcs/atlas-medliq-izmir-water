import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-spectours-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class SpectoursInfobarComponent implements OnInit {

  @Output() close = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
