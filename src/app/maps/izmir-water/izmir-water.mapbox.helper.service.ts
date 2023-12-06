import { Injectable } from '@angular/core';
import { IzmirWaterLanguageService } from './izmir-water.language.service';
import { IzmirWaterEventManagerService } from './izmir-water.eventmanager.service';

@Injectable()
export class IzmirWaterMapboxHelperService {

  selectedLanguageOption = 'TR';

  constructor(private languageApi : IzmirWaterLanguageService,
    private eventManager: IzmirWaterEventManagerService) { 
    this.eventManager.languageChanged.subscribe(
      (selection: string) => {
        this.selectedLanguageOption = selection;
      });
  }

  createBlankMarkerElement(name: string, datePeriod: string, imageUrl: string): HTMLElement {
    const element = document.createElement('div');
    if (imageUrl == '' || imageUrl == null) { imageUrl = "assets/img/iw-video-thumbnail.png"; }
    element.innerHTML =
    '<div id="currentSelectedMarker" style="color: rgba(255, 255, 255, 1);font-family: Inter;position: relative;display: flex;flex-direction: column;column-gap: 2%;border-radius: 8px;background: rgba(18, 18, 18, 0.75);backdrop-filter: blur(25px);height: 90%;width: 90%;margin: 3%;" >' +
    ' <div style="position: absolute;display: flex;height: 100%;width: 100%;" >' +
    '   <div style="width: 50%;">' +
    '     <img style="position: relative;top: 50%;left: 50%;transform: translate(-50%, -50%);border-radius: 8px;max-width: 80%;max-height: 80%;"src="' + imageUrl + '" />' +
    '   </div>' +
    '   <div style="width: 50%;display: flex;flex-direction: column;align-items: center;justify-content: center;row-gap: 1%;padding-right: 3%;">' +
    '     <div style="font-size: 13px;font-weight: 700;width: 100%;">' + name + '</div>' +
    '     <div style="font-size: 10px;font-weight: 400;width: 100%;padding-bottom: 3%; overflow: hidden; text-overflow: ellipsis;">' + datePeriod + '</div>' +
    '     <div style="cursor: pointer; width: 100%;font-family: Inter;font-size: 10px;text-align: right;">' + this.languageApi.getReadMoreTranslation(this.selectedLanguageOption) + ' →</div>'
    '   </div>' +
    ' </div>' +
    '</div>';
    element.style.padding = '0.5rem';
    element.style.width = '17rem';
    element.style.height = '10rem';
    return element;
  }

  karantinaIcon(map: mapboxgl.Map, karantinaPosition: number[], karantinaZoom: number, karantinaPitch: number): HTMLElement {
    const element = document.createElement('div');
    element.addEventListener('mouseover', () => {
      element.classList.add('hovered');
    });
    element.addEventListener('mouseout', () => {
      element.classList.remove('hovered');
    });

    const style = document.createElement('style');
    style.textContent = ".hovered { padding: 2px }";

    element.innerHTML = 
    '<img style="max-width: 100%; border-radius: 8px;" src="../../../assets/img/iw-karantina-logo.png"></img>';
    document.head.appendChild(style);
    element.style.width = '15rem';

    element.addEventListener('click', (e) => {
      map.easeTo({
        center: [karantinaPosition[0], karantinaPosition[1]],
        zoom: karantinaZoom,
        pitch: karantinaPitch
      })
    });
    return element;
  }

  returnToIzmirMarker(map: mapboxgl.Map, mapCentre: number[], standardZoom: number, standardPitch: number): HTMLElement {
    const element = document.createElement('div');
    element.innerHTML =
    '<div style="font-family: Inter; font-weight: 500;">' +
    '<p style="margin-left: 0.75rem; margin-top:0; margin-bottom:0; margin-right: 0;">' +
      '↩ Return to Izmir'
    '</p>' +
    '</div>';
    element.style.padding = '0.5rem';
    element.style.width = '8rem';
    element.style.height = '2.3rem';
    element.style.background = '#252525';
    element.style.border = '1px solid #252525';
    element.style.borderRadius = '8px';
    element.style.color = '#fff';

    element.addEventListener('click', (e) => {
      map.easeTo({
        center: [mapCentre[0], mapCentre[1]],
        zoom: standardZoom,
        pitch: standardPitch
      })
    });
  return element;
  }
}