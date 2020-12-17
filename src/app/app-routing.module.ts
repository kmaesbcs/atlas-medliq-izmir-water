import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WawbComponent } from './maps/m1wawb/wawb.component';

const routes: Routes = [
  {path: 'm1', component: WawbComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
