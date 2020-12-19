import { Component, Input, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-spectours-content-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.less']
})
export class TwitterComponent implements OnInit {

  @Input() item;

  constructor() { }

  ngOnInit(): void {
  }

  get timestamp() {
    return dayjs(this.item.post_timestamp[0]).format(('h:mm A - MMM D, YYYY'));
  }
}
