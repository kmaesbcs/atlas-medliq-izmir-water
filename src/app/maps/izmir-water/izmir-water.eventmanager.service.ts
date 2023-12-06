import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IzmirWaterEventManagerService {
  languageChanged: EventEmitter<string> = new EventEmitter<string>();

  emitSelection(selection: string) {
    this.languageChanged.emit(selection);
  }
}