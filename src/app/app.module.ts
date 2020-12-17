import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { M1wawbComponent } from './maps/m1wawb/m1wawb.component'
import { WawbSidebarComponent } from './maps/m1wawb/sidebar/sidebar.component';
import { PlayerComponent } from './player/player.component';
import { WawbInfobarComponent } from './maps/m1wawb/infobar/infobar.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    M1wawbComponent,
    WawbSidebarComponent,
    WawbInfobarComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
