import { Injectable } from '@angular/core';

import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  current: Player = null;

  playing(player: Player) {
    if (this.current === player) {
      return;
    }
    if (this.current !== null) {
      this.current.pause();
    }
    this.current = player;
  }

  stopped(player: Player) {
    if (this.current === player) {
      this.current = null;
    }
  }
}
