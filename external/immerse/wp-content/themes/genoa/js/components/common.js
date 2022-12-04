export const italian = window.location.pathname.indexOf('/it') !== -1;
export const homeUrl = italian ? '../' : '';
export const themeBase = homeUrl + 'wp-content/themes/genoa/';


export const MOBILE_WIDTH = 820;
export function t(str) {
  const strings = window.siteOptions.strings;
  const stringWasTranslated = strings && (str in strings);

  if(stringWasTranslated)
    return strings[str];
  else
    return str;
}
