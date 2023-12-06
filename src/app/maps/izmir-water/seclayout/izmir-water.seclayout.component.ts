import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IzmirWaterEventManagerService } from '../izmir-water.eventmanager.service';

@Component({
  selector: 'app-izmir-water-seclayout',
  templateUrl: './izmir-water.seclayout.component.html',
  styleUrls: ['./izmir-water.seclayout.component.less'],
})
export class IzmirWaterLayoutComponent implements OnInit {
  @Input() hideHeader = false;
  @Output() info = new EventEmitter<boolean>();

  languageOptions = ['TR', 'DE', 'EN'];
  selectedLanguageOption = '';

  constructor(private eventManager: IzmirWaterEventManagerService) {
    this.selectedLanguageOption = this.languageOptions[0];
  }

  ngOnInit(): void {}

  onLanguageChange() {
    this.eventManager.emitSelection(this.selectedLanguageOption);
  }
}
