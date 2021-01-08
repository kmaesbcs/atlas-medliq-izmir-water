import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Player } from 'src/app/player';
import { PlayerService } from 'src/app/player.service';
import { TroubledwatersService } from '../troubledwaters.service';

@Component({
  selector: 'app-troubledwaters-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class TroubledwatersPlayerComponent implements OnInit {

  segments = [];
  segment: any = {};
  segmentIndex = -1;

  // interviewees = [];
  // intervieweeIndex = -1;
  // interviewee = null;
  intervieweeColor = 'black';

  player: Player = null;

  constructor(public troubledWaters: TroubledwatersService, private playerService: PlayerService) {
    troubledWaters.data.pipe(first()).subscribe((data) => {
      // const ids = [];
      this.segments = data;
      let index = 0;
      for (const segment of data) {
        segment.segmentIndex = index;
        index++;
        // if (ids.indexOf(segment.interviewee.id) === -1) {
        //   this.interviewees.push(segment.interviewee);
        //   ids.push(segment.interviewee.id);
        // }
      }
      troubledWaters.position.subscribe(({segment, timestamp, offset}) => {
        if (segment.id !== this.segment.id) {
          this.segment = segment;
          this.intervieweeColor = segment.interviewee.color;
          this.initPlayer();
          if (this.troubledWaters.playing) {
            this.player.play();            
          }
          this.player.seekTime(offset);
        } else {
          if (this.player.audio && Math.abs(offset - this.player.audio.currentTime) > 2) {
            this.player.seekTime(offset);
          }
        }
        for (let idx = 0 ; idx < this.segments.length ; idx++) {
          const s = this.segments[idx];
          if (segment.id === s.id) {
            this.segmentIndex = idx;
          }
        }
      });
    })
  }

  ngOnInit(): void {
    
  }

  transform() {
    const offset = this.segmentIndex * (60 + 32) + (120 / 2);
    return `translateY(calc(50% - ${offset}px))`
  }

  pause() {
    this.troubledWaters.playing = false;
    this.player.pause();
  }

  play() {
    this.troubledWaters.playing = true;
    this.player.play();
  }

  initPlayer() {
    if (this.player !== null) {
      this.player.cleanup();
    }
    this.player = new Player(this.segment.audio, this.playerService);
    this.player.timestamp.subscribe((offset) => {
      if (this.troubledWaters.playing) {
        this.troubledWaters.setPosition({segment: this.segment, offset});
      }
    });
    this.player.playing.subscribe((playing) => {
    });
    this.player.ended.subscribe(() => {
      if (this.segment.segmentIndex + 1 < this.segments.length) {
        this.troubledWaters.setPosition({segment: this.segments[this.segment.segmentIndex + 1]});
      } else {
        this.troubledWaters.playing = false;
      }
    });

  }

}
