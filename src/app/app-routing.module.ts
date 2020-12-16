import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { M1wawbComponent } from './maps/m1wawb/m1wawb.component';

const routes: Routes = [
  {path: 'm1', component: M1wawbComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
