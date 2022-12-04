/**
 * API backend access functions
 */

const win = (<any>window);
const $ = win.jQuery;
const BASE_URL = getOption('homeUrl');
import * as Cookies from 'js-cookie';
import throttle from 'lodash/throttle';

const WAIT = Symbol();

/**
 * Get a default option, defined in Wordpress.
 * By default it should be part of the window.siteOptions object.
 * But if not, try using ?js_site_options to get it explicitly.
 */
export async function getOption(optionName: string) {

  if(!('siteOptions' in window)) {
    console.log(window['siteOptions']);
    const options = JSON.parse(await $.get('?js_site_options'));
    win.siteOptions = options;
  }

  return win.siteOptions[optionName];
}


/**
 * Register an event with Analytics and/or Facebook pixel, if found
 */
export function sendEvent(category, action, label, value = null) {
  const win = <any>window;
  if ('ga' in win) win.ga('send', 'event', category, action, label, value);
  if ('fbq' in win) win.fbq('track', category + ' ' + action, {label: label, value: value})
  console.log('Registering event', category, action, label, value);
}


/**
 * Get the nonce from the /wp-nonce/<action> route.
 */
export async function getNonce(action = 'wp_rest') {
  if(!getOption('nonceUrl')) {
    console.error('No nonce page found. Please create one, to use the site\'s AJAX functionality');
    return false;
  }

  return locallyCache('nonce_' + action, async () => {
    const nonceUrl = await getOption('nonceUrl');
    const url = nonceUrl + '?action=' + action;
    return $.get(url).then((nonce) => {
      return nonce;
    });
  });
}

/**
 * Debounce and cache requests, using semaphors and events, with manual invalidation,
 * rather than _.debounce's time-based timeouts.
 * In larger projects, should probably be replaced by a proper RFP system like RxJS.
 */
async function locallyCache(key, callback) {
  if (!win.ekLocalCache) win.ekLocalCache = {};

  if(win.ekLocalCache[key] && win.ekLocalCache[key] !== WAIT) {
    return win.ekLocalCache[key];
  }
  else if(win.ekLocalCache[key] == WAIT) {
    return new Promise((resolve, reject) => {
      $(window).on('local-cache-updated-' + key, () => {
        resolve(win.ekLocalCache[key]);
      });
    });
  }
  else {
    win.ekLocalCache[key] = WAIT;
    const value = win.ekLocalCache[key] = await callback();
    $(window).trigger('local-cache-updated-' + key);
    return value;
  }
}

/**
 * Invalidate the cache manually, removing both the cookie and local cache var
 */
function invalidateAjaxLocalCache(key) {
  delete win.ekLocalCache['ajax-' + key];
  Cookies.remove(key, { path: '/' });
}

/**
 * Check if logged in, by checking the appropriate cookies
 */
export async function isLoggedIn(): Promise<any> {
  return locallyCache('isLoggedIn', () => {
    return Cookies.get('is-logged-in');
  });
}

/**
 * General ajax call for wordpress API
 */
export async function ajaxCall(action, nonceKey, variables, verb = 'post', cacheKey: string | null = null) {
  if (Cookies.get(cacheKey) && cacheKey) {
    return new Promise((resolve, reject) => {
      resolve(Cookies.get(cacheKey));
    })
  } else {
    variables.nonce = await getNonce(nonceKey);
    variables.action = action;
    const url = await getOption('ajaxUrl');
    const getData = async () => {
      return $.ajax({
        url: url,
        method: verb,
        data: variables,
        dataType: 'json',
      });
    };

    if (variables.nonce) {
      if(cacheKey) {
        const data = await locallyCache('ajax-' + cacheKey, getData);
        Cookies.set(cacheKey, data, { path: '/' });
        return data;
      }
      else {
        return getData();
      }
    }
    else {
      return false;
    }
  }
}

/**
 * Get a JSON using <root_url>/json/<action>?params
 * A simpler way than AJAX, that's more cachable, and doesn't require a nonce.
 */
export async function getJSON(action, extraOptions = {}) {
  const params = new URLSearchParams(extraOptions).toString();
  const url = await getOption('homeUrl') + '/json/' + action + params;
  return $.getJSON(url);
}

/**
 * Add to email. Note that since this is not specific to this API,
 * it uses a direct AJAX call to the Wordpress AJAX, rather than
 * using the REST API interface
 */
export async function addToNewsletter(options) {
  return await ajaxCall('newsletter_add', 'newsletter-nonce', {
    email: options.email,
    name: options.name,
    type: 'mailchimp',
  });
}

/**
 * Get the recipes using a simple JSON
 */
export interface Term {
  slug: string;
  name: string;
}

export interface Recipe {
  title: string;
  slug: string;
  link: string;
  thumbnail: string;
  categories: Term[];
  tags: Term[];
  time: number;
  cost: number;
  ingredients: { text: string; only_note: boolean }[],
  date: number;
  comments: number;
  excerpt: string;
}

const throttledGetRecipes = throttle(() => getJSON('recipes'), 10000)
export async function getRecipes() : Promise<Recipe[]> {
  return await throttledGetRecipes();
}
