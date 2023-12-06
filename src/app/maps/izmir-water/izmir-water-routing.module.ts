import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { IzmirWaterComponent } from "./izmir-water.component";

const routes: Routes = [
  {
    path: '',
    component: IzmirWaterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IzmirWaterRoutingModule {}
