import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IzmirWaterAboutUsComponent } from './aboutus/aboutus.component';
import { IzmirWaterDetailPanelComponent } from './detailpanel/detailpanel.component';
import { IzmirWaterComponent } from './izmir-water.component';
import { IzmirWaterLayoutComponent } from './seclayout/izmir-water.seclayout.component';
import { IzmirWaterRoutingModule } from './izmir-water-routing.module';
import { FormsModule } from '@angular/forms';



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
  ]
})
export class IzmirWaterModule { }
