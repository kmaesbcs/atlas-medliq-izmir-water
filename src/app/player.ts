import { BehaviorSubject, from, fromEvent, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first, map, tap } from 'rxjs/operators';

import { PlayerService } from './player.service';

export class Player {
    audio: HTMLAudioElement;
    subscriptions: Subscription[] = [];

    playing = new BehaviorSubject<boolean>(false); 
    ready = new BehaviorSubject<boolean>(false); 
    timestamp = new BehaviorSubject<number>(0); 
    position = new BehaviorSubject<number>(0); 
    ended = new Subject();; 

    constructor(public url: string, private playerService: PlayerService) {
        this.audio = new Audio(url);
        fromEvent(this.audio, 'canplaythrough').pipe(first()).subscribe(() => {
            this.ready.next(true);
        });
        this.subscriptions.push(...[
            fromEvent(this.audio, 'play').subscribe(() => {
                this.playing.next(true);
            }),
            fromEvent(this.audio, 'pause').subscribe(() => {
                this.playing.next(false);
            }),
            fromEvent(this.audio, 'ended').subscribe(() => {
                this.ended.next();
                this.playing.next(false);
                if (this.audio) {
                    this.audio.fastSeek(0);
                }
            }),
            fromEvent(this.audio, 'timeupdate').pipe(
                map(() => {
                    const timestamp = Math.floor(this.audio.currentTime);
                    if (timestamp !== this.timestamp.getValue()) {
                        this.timestamp.next(timestamp);
                    }
                    return Math.round(this.audio.currentTime / this.audio.duration * 1000);
                }),
                distinctUntilChanged(),
            ).subscribe((pos) => {
                this.position.next(pos);
            })
        ]);
        this.playing.next(false);
    }

    seek(percent) {
        if (this.audio) {
            this.audio.currentTime = this.audio.duration * percent;
        }
    }
    
    seekTime(seconds) {
        if (this.audio) {
            this.ready.pipe(
                filter((x) => x),
                first()
            ).subscribe(() => {
                this.audio.currentTime = seconds;
            });
        }
    }

    play() {
        if (!this.playing.getValue()) {
            this.ready.pipe(
                filter((x) => x),
                first()
            ).subscribe(() => {
                this.playerService.playing(this);
                this.audio.play();
            });
        }
    }

    pause() {
        if (this.playing.getValue()) {
            this.audio.pause();
            this.playerService.stopped(this);
        }
    }

    toggle() {
        if (this.playing.getValue()) {
            this.pause();
        } else {
            this.play();
        }
    }

    cleanup() {
        if (this.audio !== null) {
            this.pause();
            this.audio.remove();
            this.audio = null;
        }
        while (this.subscriptions.length > 0) {
            this.subscriptions.shift().unsubscribe();
        }
    }
}
