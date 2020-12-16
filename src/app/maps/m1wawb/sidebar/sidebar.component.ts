import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent implements OnInit {

  @Input() item;
  @Output() close = new EventEmitter();

  image_placeholder = 'assets/img/player-placeholder.png'

  constructor() { }

  ngOnInit(): void {
    console.log(this.item);
  }

}
