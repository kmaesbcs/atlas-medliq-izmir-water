import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.less']
})
export class LayoutComponent implements OnInit {

  @Output() info = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

}
