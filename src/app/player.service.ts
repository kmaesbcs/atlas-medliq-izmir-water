import { Injectable } from '@angular/core';

import { BehaviorSubject, fromEvent, ReplaySubject, Subscription } from 'rxjs';
import { first, subscribeOn } from 'rxjs/operators';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  current: Player = null;
  clock = new ReplaySubject<string>(1);
  clockSub: Subscription = null;

  playing(player: Player) {
    if (this.current === player) {
      return;
    }
    if (this.current !== null) {
      this.current.pause();
    }
    this.current = player;
    if (this.clockSub) {
      this.clockSub.unsubscribe();
    }
    this.clockSub = player.hiResTimestamp.subscribe((offset) => {
      const left = Math.floor(offset/10); // Math.floor(this.segment.duration) - offset;
      let clock = '' + left % 60
      if (clock.length == 1) {
        clock = '0' + clock;
      }
      clock = Math.floor(left/60) + ':' + clock;
      if (clock.length < 5) {
        clock = '0' + clock;
      }
      this.clock.next(clock);
    })
  }

  stopped(player: Player) {
    if (this.current === player) {
      this.current = null;
      if (this.clockSub) {
        this.clockSub.unsubscribe();
        this.clockSub = null;
        this.clock.next('');
      }
    }
  }
}
