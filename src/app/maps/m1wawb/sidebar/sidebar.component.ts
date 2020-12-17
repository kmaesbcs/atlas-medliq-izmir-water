import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as dayjs from 'dayjs';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-wawb-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class WawbSidebarComponent implements OnInit {

  @Input() item;
  @Output() close = new EventEmitter();
  
  authors = {};
  authorExpanded = false;
  
  image_above_placeholder = 'assets/img/player-placeholder.png'
  image_below_placeholder = 'assets/img/player-placeholder.png'

  constructor(private api: ApiService) {
    this.api.m1GetAuthors().subscribe((authors) => {
      this.authors = authors;
    });  
  }

  ngOnInit(): void {
    console.log(this.item);
  }

  get date() {
    return dayjs(this.item.date).format(('dddd, D MMMM YYYY, h:mm a'))
  }

  get author() {
    console.log('get author', this.item.author[0], this.authors);
    if (this.item.author) {
      return this.authors[this.item.author];
    }
  }
}
