import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SpecToursService } from '../spectours.service';

import * as marked from 'marked'
import { DomSanitizer } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-spectours-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class SpectoursInfobarComponent implements OnInit {

  @Output() close = new EventEmitter();
  
  marked = marked;
  aboutContent: any = '';

  constructor(public spectours: SpecToursService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.spectours.ready.pipe(first()).subscribe(() => {
      this.aboutContent = this.sanitizer.bypassSecurityTrustHtml(marked(this.spectours.ABOUT))
    });
  }
}
