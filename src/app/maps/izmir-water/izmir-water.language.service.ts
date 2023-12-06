import { Injectable } from '@angular/core';

@Injectable()
export class IzmirWaterLanguageService {

  constructor() { 
  }

  
  translationDictionary: TranslationDictionary = {
    readMore: {
      en: 'Read more',
      de: 'Mehr lesen',
      tr: 'Devam',
    },
  };
  
  getReadMoreTranslation(languageCode: string): string {
  
    const key = 'readMore';
    const normalizedLanguageCode = languageCode.toLowerCase();

    if (this.translationDictionary[key] && this.translationDictionary[key][normalizedLanguageCode]) {
      return this.translationDictionary[key][normalizedLanguageCode];
    } else {
      return "Read more";
    }
  }

  setMainLanguageOptions(point: any, language: string): void {
    if (point === null) return;

    point.selectedLanguage = language;

    switch (point.selectedLanguage) {
      case 'TR':
        point.Name = point.Name_TR;
        break;
      case 'DE':
        point.Name = point.Name_DE;
        break;
      case 'EN':
        point.Name = point.Name_EN;
        break;
      default:
        point.Name = point.Name_TR;
        break;
    }
  }
  setDetailLanguageOptions(image: any, language: string): void {
    switch (language) {
      case 'TR':
        image.Date_Period_ArtworkType = image.Date_Period_ArtworkType_TR;
        image.Description = image.Description_TR;
        break;
      case 'DE':
        image.Date_Period_ArtworkType = image.Date_Period_ArtworkType_DE;
        image.Description = image.Description_DE;
        break;
      case 'EN':
        image.Date_Period_ArtworkType = image.Date_Period_ArtworkType_EN;
        image.Description = image.Description_EN;
        break;
      default:
        image.Date_Period_ArtworkType = image.Date_Period_ArtworkType_TR;
        image.Description = image.Description_TR;
        break;
    }
  }

  setAboutUsLanguageOptions(info: any, language: string): void {
    switch (language) {
      case 'TR':
        info.Project_Name = info.Project_Name_TR;
        info.Team = info.Team_TR;
        info.Project_Description = info.Project_Description_TR;
        break;
      case 'DE':
        info.Project_Name = info.Project_Name_DE;
        info.Team = info.Team_DE;
        info.Project_Description = info.Project_Description_DE;
        break;
      case 'EN':
        info.Project_Name = info.Project_Name_EN;
        info.Team = info.Team_EN;
        info.Project_Description = info.Project_Description_EN;
        break;
      default:
        info.Project_Name = info.Project_Name_TR;
        info.Team = info.Team_TR;
        info.Project_Description = info.Project_Description_TR;
        break;
    }
    return info;
  }

  getFirstImageUrlFromBlob(attachments: string) {
    const split = attachments.split(',');
    const filtered = split.filter(x => x.toLocaleLowerCase().includes('large'));
    if (filtered && filtered.length > 0) {
      const urlStart = filtered[0].indexOf('https');
      const urlEnd = filtered[0].lastIndexOf('"');
      return filtered[0].substring(urlStart, urlEnd);
    }
    return '';
  }

  getFirstDatePeriodFromBlob(point: any, language: string) {
    if (point == null) return '';
    const datePeriod = language == 'TR' ? point.Date_Period_ArtworkType_TR 
      : language == 'DE' ? point.Date_Period_ArtworkType_DE 
        : point.Date_Period_ArtworkType_EN
    var santizedString = this.sanitizeBlob(datePeriod);

    const split = santizedString.split(',');
    if (split && split.length > 0) {
      return split[0];
    }
    return '';
  }

  getNameByLanguage(point: any, language: string) {
    if (point == null) return '';
    return language === 'TR' ? point.Name_TR 
      : language === 'DE' ? point.Name_DE 
        : point.Name_EN
  }

  sanitizeBlob(s: string) {
    if (s == null) return '';
    return s = s.replace(/[\['"\]]+/g, '') as any;
  }
}

interface TranslationDictionary {
  [key: string]: {
    en: string;
    de: string;
    tr: string;
  };
}