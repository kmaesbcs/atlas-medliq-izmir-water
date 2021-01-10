import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { Player } from 'src/app/player';
import { PlayerService } from 'src/app/player.service';
import { Scroller } from '../scroller';
import { TroubledwatersService } from '../troubledwaters.service';

@Component({
  selector: 'app-troubledwaters-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class TroubledwatersPlayerComponent implements OnInit, AfterViewInit {

  segments = [];
  segment: any = {};
  segmentIndex = -1;

  // interviewees = [];
  // intervieweeIndex = -1;
  // interviewee = null;
  intervieweeColor = 'black';
  @ViewChild('interviewees', {static: true}) interviewees: ElementRef;
  
  scroller: Scroller = null;
  player: Player = null;
  players = {};

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
      troubledWaters.position.pipe(delay(0)).subscribe(({segment, timestamp, offset}) => {
        if (segment.id !== this.segment.id) {
          this.segment = segment;
          this.intervieweeColor = segment.interviewee.color;
          this.initPlayer();
          if (this.troubledWaters.playing) {
            this.player.seekTime(offset);
            this.player.play();            
          }
        } else {
          if (this.player.audio && Math.abs(offset - this.player.audio.currentTime) > 2) {
            this.player.seekTime(offset);
          }
        }
        for (let idx = 0 ; idx < this.segments.length ; idx++) {
          const s = this.segments[idx];
          if (segment.id === s.id) {
            this.segmentIndex = idx;
            const offset = this.segmentIndex * (60 + 32) + 30;
            this.scroller.update(offset);  
          }
        }
      });
    });
    fromEvent(window, 'blur').subscribe(() => {
      if (this.player !== null) {
        this.pause();
      }  
    })
  }

  ngAfterViewInit(): void {
    this.scroller = new Scroller(this.interviewees.nativeElement, '.interviewee');
  }

  ngOnInit(): void {
    
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
      console.log('cleanup PLAYER', this.player.url);
      this.player.pause();
    }
    console.log('init PLAYER', this.segment.audio);
    this.player = this.players[this.segment.audio];
    if (!this.player) {
      this.player = new Player(this.segment.audio, this.playerService);
      this.players[this.segment.audio] = this.player;
    }
    this.player.timestamp.subscribe((offset) => {
      // this.position = '' + offset % 60
      if (this.troubledWaters.playing) {
        console.log('PPP', this.segment.id, offset, this.player.url);
        this.troubledWaters.setPosition({segment: this.segment, offset, who: 'play-position'});
      }
    });
    this.player.playing.subscribe((playing) => {
    });
    this.player.ended.subscribe(() => {
      if (this.segment.segmentIndex + 1 < this.segments.length) {
        this.troubledWaters.setPosition({segment: this.segments[this.segment.segmentIndex + 1], who: 'play-ended'});
      } else {
        this.troubledWaters.playing = false;
      }
    });

  }

}
