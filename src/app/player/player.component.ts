import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Player } from '../player';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit, OnChanges, OnDestroy {

  @Input() audio;
  @Input() image;

  SIZE = 280;
  BAR_WIDTH = 4;

  player: Player = null;
  progressBarPath = '';
  positionSub: Subscription;

  constructor(private playerService: PlayerService) { }

  ngOnInit(): void {
  }

  createPlayer() {
    if (this.audio) {
      this.player = new Player(this.audio, this.playerService);
      this.positionSub = this.player.position.subscribe((pos) => {
        this.calculateProgressBarPath(pos/1000*2*Math.PI);
      });
    }
  }

  cleanupPlayer() {
    if (this.player !== null) {
      this.player.cleanup();
      this.positionSub.unsubscribe();
      this.player = null;
      this.progressBarPath = '';
    }
  }

  ngOnChanges() {
    this.cleanupPlayer();
    this.createPlayer();
  }

  ngOnDestroy() {
    this.cleanupPlayer();
  }

  calculateProgressBarPath(angle) {
    const C = this.SIZE/2;
    const R = (this.SIZE - this.BAR_WIDTH) / 2;
    const X = C + R * Math.sin(angle);
    const Y = C - R * Math.cos(angle);
    const params = angle >= Math.PI ? '1 1' : '0 1';
    this.progressBarPath = `M${C} ${C-R} A ${R} ${R} 0 ${params} ${X} ${Y}`;
  }
}
