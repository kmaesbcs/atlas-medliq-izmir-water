import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WawbComponent } from './maps/m1wawb/wawb.component';
import { SpecToursComponent } from './maps/m2spectours/spectours.component';

const routes: Routes = [
  {path: 'm1', component: WawbComponent},
  {path: 'm2', component: SpecToursComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
