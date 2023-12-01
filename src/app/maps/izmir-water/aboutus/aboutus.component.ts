import {
  Component,
  EventEmitter,
  OnChanges,
  Output
} from '@angular/core';

import { IzmirWaterDataService } from '../izmir-water.data.service';
import { IzmirWaterLanguageService } from '../izmir-water.language.service';
import { IzmirWaterEventManagerService } from '../izmir-water.eventmanager.service';

@Component({
  selector: 'app-izmir-water-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.less'],
})
export class IzmirWaterAboutUsComponent implements OnChanges {

  @Output() close = new EventEmitter();

  selectedLanguageOption;
  contributor_suyumuz = 'suyumuz';
  contributor_goethe = 'goethe-institut';
  contributor_karantina = 'karantina';
  contributor_egedernegi = 'ege derneği';
  currentContributor = '';

  aboutInfo: any[];
  currentAboutInfo: any;
  suyumuzAboutInfo: any;
  karantinaAboutInfo: any;
  goetheAboutInfo: any;
  egedernegiAboutInfo: any;


  constructor(private dataApi: IzmirWaterDataService, 
    private languageService : IzmirWaterLanguageService,
    private eventManager: IzmirWaterEventManagerService) { 
    
    this.eventManager.languageChanged.subscribe(
      (selection: string) => {
        this.selectedLanguageOption = selection;
        this.currentAboutInfo = this.languageService.setAboutUsLanguageOptions(this.currentAboutInfo, this.selectedLanguageOption);
        this.suyumuzAboutInfo = this.languageService.setAboutUsLanguageOptions(this.suyumuzAboutInfo, this.selectedLanguageOption)
        this.karantinaAboutInfo = this.languageService.setAboutUsLanguageOptions(this.karantinaAboutInfo, this.selectedLanguageOption)
        this.goetheAboutInfo = this.languageService.setAboutUsLanguageOptions(this.goetheAboutInfo, this.selectedLanguageOption)
        this.egedernegiAboutInfo = this.languageService.setAboutUsLanguageOptions(this.egedernegiAboutInfo, this.selectedLanguageOption)
      }
    );

    this.currentContributor = this.contributor_suyumuz; 
    this.dataApi.getAboutUsInfo().subscribe((response) => {
      this.aboutInfo = response;

      this.aboutInfo.forEach(info => {
        info = this.languageService.setAboutUsLanguageOptions(info, this.selectedLanguageOption);
        info.Name = info.Name.toLowerCase();

        switch (info.Name) {
          case this.contributor_suyumuz:
            this.suyumuzAboutInfo = info;
            break;
          case this.contributor_egedernegi:
            this.egedernegiAboutInfo = info;
            break;
          case this.contributor_goethe:
            this.goetheAboutInfo = info;
            break;
          case this.contributor_karantina:
            this.karantinaAboutInfo = info;
            break;
          default:
            break
        }
      })
      this.getCurrentContributorInfo();
    });
  }

  getCurrentContributorInfo() {
    if (this.currentContributor == null || this.aboutInfo == null) return;
    var info = this.aboutInfo.find(x => x.Name.toLowerCase() == this.currentContributor);
    this.currentAboutInfo = info;
  }

  switchCurrentContributorDisplay(contributor: string) {
    this.currentContributor = contributor;
    this.getCurrentContributorInfo();
  }

  ngOnChanges(): void {
    this.getCurrentContributorInfo();
  }

}
