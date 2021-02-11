import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { WawbComponent } from './maps/m1wawb/wawb.component';
import { SpecToursComponent } from './maps/m2spectours/spectours.component';
import { TroubledwatersComponent } from './maps/m3troubledwaters/troubledwaters.component';

const routes: Routes = [
  {path: 'm1', component: WawbComponent},
  {path: 'm2', component: SpecToursComponent},
  {path: 'm3', component: TroubledwatersComponent},
  {path: '', component: MainPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
