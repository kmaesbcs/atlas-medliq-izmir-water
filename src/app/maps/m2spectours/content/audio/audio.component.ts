import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { PlayerComponent } from 'src/app/player/player.component';

@Component({
  selector: 'app-spectours-content-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.less']
})
export class AudioComponent implements OnInit, OnChanges {

  @Input() item;
  @Input() active = false;
  @ViewChild(PlayerComponent, {static: true}) player: PlayerComponent;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.player && this.player.player) {
      if (this.active) {
        this.player.player.play();
      } else {
        this.player.player.pause();
      }  
    }
  }

}
