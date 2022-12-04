import {
  toggleLinks,
  initComponents,
  fixVH,
  scrollToLinks,
  markLazyLoadedImages,
  lazyLoadVideos,
} from "@/utils";

import App from '@components/App.svelte';
const win = <any>window;
const $ = win.jQuery;

window.addEventListener('DOMContentLoaded', async () => {
  win.__webpack_public_path__ = (<any>window).siteOptions.themePath + '/js/public/';

  fixVH();
  boostrap();
});

function boostrap() {
  const appEl = document.querySelector('App');
  const options = window[appEl.getAttribute('options')];
  const stories = window[appEl.getAttribute('stories')];
  const languages = window[appEl.getAttribute('languages')];
  return new App({
    target: appEl,
    props: { options, stories, languages, currentLanguage: window['siteOptions'].language },
  })

}


