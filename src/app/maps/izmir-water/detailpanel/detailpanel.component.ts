import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { first } from 'rxjs/operators';
import { IzmirWaterDataService } from '../izmir-water.data.service';
import { IzmirWaterLanguageService } from '../izmir-water.language.service';

@Component({
  selector: 'app-izmir-water-detailpanel',
  templateUrl: './detailpanel.component.html',
  styleUrls: ['./detailpanel.component.less'],
})
export class IzmirWaterDetailPanelComponent implements OnChanges {
  @Input() item;
  @Input() isVisible;
  @Output() close = new EventEmitter();
  private currentIndex: number;

  constructor(
    private api: IzmirWaterDataService,
    private languageApi: IzmirWaterLanguageService
  ) {}

  ngOnChanges(): void {
    this.isVisible = false;
    this.api.details.pipe(first()).subscribe((details) => {
      if (this.item && this.item.Images) {
        var s = this.api.sanitizeBlob(this.item.Images);
        const images = s.split(',');
        for (const i in images) {
          images[i] = Object.assign({}, details[images[i]]);
          this.languageApi.setDetailLanguageOptions(
            images[i],
            this.item.selectedLanguage
          );
        }
        this.item.details = images;

        this.currentIndex = 0;
      }
    });
  }

  nextItem(index: number) {
    const length = this.item.details.length - 1;

    if (this.currentIndex < length) {
      this.currentIndex = this.currentIndex + 1;
    } else {
      this.currentIndex = 0;
    }
  }

  prevItem(index: number) {
    const length = this.item.details.length - 1;

    if (this.currentIndex > 0) {
      this.currentIndex = this.currentIndex - 1;
    } else {
      this.currentIndex = length;
    }
  }
}
