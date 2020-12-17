import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wawb-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class WawbInfobarComponent implements OnInit {

  @Output() close = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
