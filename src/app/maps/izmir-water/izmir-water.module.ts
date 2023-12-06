import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IzmirWaterAboutUsComponent } from './aboutus/aboutus.component';
import { IzmirWaterDetailPanelComponent } from './detailpanel/detailpanel.component';
import { IzmirWaterComponent } from './izmir-water.component';
import { IzmirWaterLayoutComponent } from './seclayout/izmir-water.seclayout.component';
import { IzmirWaterRoutingModule } from './izmir-water-routing.module';
import { FormsModule } from '@angular/forms';
import { IzmirWaterEventManagerService } from './izmir-water.eventmanager.service';
import { IzmirWaterLanguageService } from './izmir-water.language.service';
import { IzmirWaterMapService } from './izmir-water.map.service';
import { IzmirWaterMapboxHelperService } from './izmir-water.mapbox.helper.service';



@NgModule({
  declarations: [
    IzmirWaterComponent,
    IzmirWaterDetailPanelComponent,
    IzmirWaterLayoutComponent,
    IzmirWaterAboutUsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IzmirWaterRoutingModule
  ],
  providers: [
    IzmirWaterEventManagerService,
    IzmirWaterLanguageService,
    IzmirWaterMapService,
    IzmirWaterMapboxHelperService
  ]
})
export class IzmirWaterModule { }
