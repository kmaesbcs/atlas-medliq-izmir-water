import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-spectours-content-wikipedia',
  templateUrl: './wikipedia.component.html',
  styleUrls: ['./wikipedia.component.less']
})
export class WikipediaComponent implements OnInit {

  @Input() item;

  constructor() { }

  ngOnInit(): void {
  }

}
