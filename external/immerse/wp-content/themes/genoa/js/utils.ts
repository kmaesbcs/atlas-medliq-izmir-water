/**
 * Utility functions
 */

import {getOption} from "@/api";
import isNumber from 'lodash/isNumber';

const win = (<any>window);
const $ = win.jQuery;


/**
 * Get the real width of an object-fitted image,
 * and put it inside of a custom property the parent element.
 * This is useful for making the label of a object-fit image fit its width, even on Safari.
 */
export function markObjectFitWidth(containers) {
  const mark = () => {
    console.log('marking');

    document.querySelectorAll(containers).forEach(container => {
      const image = container.querySelector('img');

      if(image) {
        const width = image.getAttribute('width');
        const height = image.getAttribute('height');
        if(width && height) {
          const ratio = parseInt(width) / parseInt(height);
          const maxRatioWidth = container.offsetHeight * ratio;
          const realWidth = Math.min(width, maxRatioWidth);

          container.parentElement.style.setProperty('--inner-width', realWidth + 'px');

        }

      }
    });
  };

  mark();
  window.addEventListener('resize', () => mark());
  window.addEventListener('load', () => mark());
  window.addEventListener('swiper.slideChange', () => mark());
  window.addEventListener('swiper.slideChangeTransitionEnd', () => mark());
}

/**
 * Mark lazy-loaded images for styling
 */
export function markLazyLoadedImages() {
  document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
    const parent = image.closest('[data-lazy-parent]') ?
                  image.closest('[data-lazy-parent]') :
                  image.parentElement;

    image.addEventListener('load', () => {
      parent.classList.add('is-lazy-loaded');
    });

    if((<HTMLImageElement>image).complete) {
      parent.classList.add('is-lazy-loaded');
    }

    setTimeout(() => {
      parent.classList.add('is-lazy-loaded');
    }, 1500)
  });
}

/**
 * Init vanilla custom components when intersecting
 */
export function initComponents(components) {
  const allSelectors = components.join(', ');
  const loadedModules = {};

  loadWhenIntersecting(allSelectors, async (element) => {
    const name = element.nodeName.toLowerCase();

    const {default: Component} = await import(`@components/${name}.ts`);
    customElements.get(name) || customElements.define(name, Component);

    if('load' in element) (<any>element).load();
  });
}

/**
 * Loads a library only when the interesection observable is met
 */
export function loadWhenIntersecting(selector, load: (target: Element) => void) {
  const items = document.querySelectorAll(selector);
  if (items.length) {
    const observer = new IntersectionObserver((els) => {
      els.forEach(entry => {
        if(entry.isIntersecting) {
          load(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px 200px 0px' });

    items.forEach(i => {
      if(i.hasAttribute('preload'))
        load(i);
      else
        observer.observe(i)
    });
  }
}

/**
 * Simple wrapper to init Svelte components when found.
 * It should appear in HTML as a <ComponentName props="{...}"></ComponentName>
 */
export function initSvelte(components) {
  components.forEach(async name => {
    const $item = $(name.toLowerCase());

    if ($item.length) {
      const {default: Component} = await import(`@components/${name}.svelte`);

      $item.each((i, item) => {
        const propsAttr = $(item).attr('props');
        const props = propsAttr ? JSON.parse(propsAttr) : {};
        item.$component = new Component({target: item, props: props});
      });
    }
  });
}

/**
 * Mark if we're scrolling left/right in a container.
 */
export function markInnerScrollPosition(selector) {

  const mark = ($item) => {
    const item = $item[0];
    const maxWidth = item.scrollWidth - item.clientWidth;
    const scrollLeft = Math.abs($item.scrollLeft());

    $item.add($item.parent()).toggleClass('is-start', scrollLeft <= 0);
    $item.add($item.parent()).toggleClass('is-end', scrollLeft >= maxWidth);
  };

  const $item = $(selector);

  mark($item);
  $item.on('scroll', () => mark($item));
}


/**
 * Copy on click links
 */
export function clickToCopyLinks(selector = '.copy-link') {
  $(document).on('click', selector, (e) => {
    e.preventDefault();

    const $item = $(e.currentTarget);
    const textToCopy = $item.attr('href') || $item.attr('data-copy-text');

    navigator.clipboard.writeText(textToCopy).then(function () {
      $item.addClass('is-copied');
    }, function () {
      $item.addClass('is-not-copied');
    });

    setTimeout(() => {
      $item.removeClass('is-copied is-not-copied');
    }, 2000);
  });
}

/**
 * Mark when unloading, so we can display an animation
 */
export function markUnload() {
  $(window).on('beforeunload', () => {
    $('html').addClass('is-page-loading');
  });
}

/**
 * Mark loading, for a nice fade effect, if needed
 */
export function markLoad() {
  setTimeout(() => {
    $('body').addClass('is-loaded')
  }, 150);
}



/**
 * Act when the hash changes, for popups and other related functionality
 */
export function onHash(prefix) {
  const go = () => {
    const hash = win.location.hash;
    $(`[data-prefix="${prefix}"]`).removeClass('is-current');

    if (hash.indexOf(prefix) != -1) {
      const slug = hash.replace(prefix, '');
      $(`[data-prefix="${prefix}"][data-slug="${slug}"]`)
          .addClass('is-current')
          .first()
          .focus();
    }
  };

  $(window).on('keyup', e => {
    if (e.key == 'Escape') win.location.hash = prefix;
  });

  go();
  $(window).on('load hashchange', () => go());
}

/**
 * Get numeric property value from element
 */
export function getCustomPropertyValue(property, el = null): number {
  if(!el) el = document.documentElement;
  return parseInt(getComputedStyle(el)
                      .getPropertyValue('--' + property)
                      .replace('px', ''))
}

/**
 * Convert element height to a custom property that can
 * be used later in CSS. For example for a height 0 -> max CSS animation
 */
export function heightToProperty(selector, property, el = null, maxWindowHeight = false, checkOnScroll = true) {
  if (!win.heightToPropertyMarkers)
    win.heightToPropertyMarkers = [];

  if (!el) el = document.documentElement;

  win.heightToPropertyMarkers.push({selector, property, maxWindowHeight, el});

  if (!win.markHeightToPropertyMarkers) {
    win.markHeightToPropertyMarkers = () => {
      win.heightToPropertyMarkers.forEach(marker => {
        const elHeight = $(marker.el).find(marker.selector).outerHeight(true);
        const height = marker.maxWindowHeight ? Math.min(elHeight, $(window).height()) : elHeight;
        $(marker.el).css('--' + marker.property, height + 'px');
      });
    };
  }

  const mark = () => {
    win.markHeightToPropertyMarkers()
  };

  mark();
  $(window).off('load.heightToProperty resize.heightToProperty');
  $(window).on('load.heightToProperty resize.heightToProperty swiper.slideChange swiper.slideChangeTransitionEnd', () => mark());

  if(checkOnScroll) {
    window.addEventListener('scroll', () => mark(), {passive: true});
  }
}


/**
 * Wrap tables in posts, so they won't extend past the post's width,
 * and create a mobile version of those tables, by adding the th to every relevant td
 */
export function responsiveTables(selector) {
  $(selector).each((i, item) => {
    $(item).wrap('<div class="table-wrapper" />');

    const headers = $(item).find('th').map((i, x) => $(x).text()).toArray();
    $(item).find('tr').each((_, tr) => {
      $(tr).find('td').each((_, td) => {
        const $td = $(td);
        const index = $td.index();
        $td.prepend(`<h4 class="tablet td-header">${headers[index]}</h4>`);
      });
    });

  });
}

/**
 * Custom cursor
 */
export function customCursor() {
  const $cursor = $('.cursor');
  const $throb = $('.cursor--throb__inner');
  const $html = $('html');

  $(document)
      .on('mousemove', (e) => {
        $cursor.css({
          top: e.clientY,
          left: e.clientX,
        })
      })
      .on('mousedown', (e) => {
        $cursor.addClass('is-down');
        $throb.attr('src', $throb.attr('data-src'));

        if (win.wvBeforetimeout || win.wvTimeout) {
          clearTimeout(win.wvBeforetimeout);
          clearTimeout(win.wvTimeout);
        }

        win.wvBeforetimeout = setTimeout(() => {
          $cursor.removeClass('is-down')
        }, $throb.data('before-timeout'));

        win.wvTimeout = setTimeout(() => {
          $throb.attr('src', '');
        }, $throb.data('timeout'));
      });

  // Over hoverable items like buttons or links
  const hoverable = 'button, a, .is-hoverable, input, .button';
  $(document)
      .on('mouseenter', hoverable, () => {
        $cursor.addClass('is-hover');
        $html.addClass('is-cursor-hover');
      })
      .on('mouseleave', hoverable, () => {
        $cursor.removeClass('is-hover')
        $html.removeClass('is-cursor-hover');
      });

  // Hide on iframes
  $(document)
      .on('mouseenter', 'iframe', () => $cursor.addClass('is-over-iframe'))
      .on('mouseleave', 'iframe', () => $cursor.removeClass('is-over-iframe'));
}

/**
 * Mark the menu items of category pages for the relevant
 * single pages, by using the data-menu-parent attribute that we
 * set on the relevant article pages
 */
export function markParentMenus() {
  if ($('[data-menu-parent]').length) {
    const menuParent = $('[data-menu-parent]').data('menu-parent');
    $(`.menu-item--${menuParent}`).addClass('current-menu-ancestor');
  }
}

/**
 * Modulo with support for negative numbers
 *
 * @param a
 * @param b
 * @return Number
 */
export function mod(a, b) {
  return ((a % b) + b) % b;
}


/**
 * Smooth scroll
 */
export function scrollTo(target, speed = 500, margin: number | string = 0, onComplete = () => {
}) {
  if ('theScroll' in window) {
    win.theScroll.scrollTo(target);
  } else {
    let finalMargin = typeof margin == 'string' ? parseInt(margin, 10) : margin;
    // If it's a computed property
    if (typeof margin == 'string' && margin.indexOf('--') == 0) {
      finalMargin = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue(margin)
          .replace('px', ''), 10) || 0;
    }

    $('html, body').animate({
      scrollTop: $(target).offset().top - finalMargin,
    }, speed, 'swing', onComplete);
  }
}


export function markScrollDirection() {
  let previousScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    document.documentElement.classList.toggle('is-scrolling-down', window.scrollY >= previousScrollY);
    document.documentElement.classList.toggle('is-scrolling-up', window.scrollY < previousScrollY);
    previousScrollY = window.scrollY;
  }, { passive: true });
}

/**
 * Focus and scroll
 */
export function focusAndScroll(el, container) {
  setTimeout(() => {
    <HTMLElement>el.focus();
    scrollTo(el);
    $(container).animate({
      scrollTop: $(el).offset().top,
    }, 150, 'swing');
  }, 50);
}

/**
 * A link with [data-toggle] that toggles a simple class
 */
export function toggleLinks() {
  document.addEventListener('click', function (e) {
    const $this = <HTMLElement>(<HTMLElement>e.target).closest('[data-toggle]');
    if(!$this || !$this.dataset || !$this.dataset.toggle) return;

    const cls = $this.dataset.toggle;
    const target = $this.dataset.toggleTarget || 'html';
    const $target = document.querySelector(target);
    console.log(target);

    if ($this.hasAttribute('data-toggle-remove'))
      $target.classList.remove(cls);
    else if ($this.hasAttribute('data-toggle-add'))
      $target.classList.add(cls);
    else
      $target.classList.toggle(cls);
  });
}


/**
 * Same as toggleLinks, but with aria-expanded
 */
export function toggleExpandedLinks() {
  $(document).on('click', '[data-toggle-expanded]', function (e) {
    const $this = $(e.currentTarget);
    const target = $this.attr('data-toggle-expanded') || 'body';
    const $target = $(target);
    const isExpanded = $target.attr('aria-expanded') === 'true';

    if (isExpanded)
      $target.attr('aria-expanded', 'false');
    else
      $target.attr('aria-expanded', 'true');
  });
}


/**
 * Blur when a focused item is clicked
 */
export function blurOnClick() {
  $(document).on('mousedown', '[data-blur-on-click]', function (e) {
    const $this = $(e.currentTarget);
    if ($this.is(':focus')) $this.blur();
  });
}

/**
 * A link with [data-focus] that toggles a simple class
 */
export function focusLinks() {
  $(document).on('click', '[data-focus]', function (e) {
    const $this = $(e.currentTarget);
    const target = $this.attr('data-focus');
    const $target = $(target);
    const wait = parseInt($this.attr('data-wait'), 10) || 200;

    setTimeout(() => {
      $target[0].focus()
    }, wait);
  });
}

/**
 * Smooth scroll-to links
 *
 * @param selector
 * @param topMargin
 * @param defaultSpeed
 */
export function scrollToLinks(selector = '.scroll-to, [data-scroll-to]', topMargin = 0, defaultSpeed = 1000) {
  $(document).on('click', selector, (e) => {
    const $this = $(e.currentTarget);
    const href = $this.attr('href');
    const hasHash = href.indexOf('#') !== -1;

    if (href && hasHash) {
      let [_, hashBeginning, hashTarget] = href.match('(.*)#(.*)');
      if (hashBeginning !== win.location.href && hashBeginning) return true;

      e.preventDefault();
      const $target = $('#' + hashTarget);
      const speed = parseInt($(e.currentTarget).attr('data-scroll-to'), 10) || defaultSpeed;
      const margin = $this.is('[data-scroll-to-margin]') ? $this.attr('data-scroll-to-margin') : topMargin;

      scrollTo($target[0], speed, margin);
    }
  });
}

/**
 * Get the mobile size from the stylesheet
 *
 * @returns {boolean}
 */
export async function isMobile(): Promise<boolean> {
  const version = await getResponsiveVersion();
  return version === 'mobile';
}

/**
 * Get the mobile size from the stylesheet
 *
 * @returns {boolean}
 */
export async function isTablet(): Promise<boolean> {
  const version = await getResponsiveVersion();
  return version === 'tablet' || version === 'mobile';
}

/**
 * Get the mobile size from the stylesheet
 *
 * @returns {boolean}
 */
export async function getResponsiveVersion(defaultSize = 750) {
  const versions = await getOption('responsiveVersions');

  const windowWidth: number = $(window).width();
  let minimumSize: number = Infinity;
  let smallestVersion: string = 'main';

  Object.keys(versions).forEach(versionName => {
    const versionWidth = isNumber(versions[versionName]) ? versions[versionName] : versions[versionName][0];

    if (versionWidth >= windowWidth && versionWidth < minimumSize) {
      minimumSize = versionWidth;
      smallestVersion = versionName;
    }
  });

  return smallestVersion;
}

/**
 * Get whether the page is RTL, by examining the HTML's "dir" attribute
 */
export function isRTL() {
  return $('html').attr('dir') == 'rtl';
}

/**
 * Replace form buttons with links, for styling
 */
export function styledButtons() {
  const style = () => {
    $('form input[type="submit"]').each(function (i, button) {
      if (!$(button).is('.is-styled')) {
        const classes = $(button).attr('class');
        const title = $(button).attr('value');
        const html = `<a class="button button--replacement ${classes}" href="javascript:void(0)">${title}</a>`;
        const $link = $(html).insertAfter(button);
        $link.on('click', () => {
          $(button).trigger('click');
        });
        $(button).hide();
        $(button).addClass('is-styled');
      }
    });
  };

  style();
  $(document).on('gform_post_render', () => style());
}

/**
 * Mark gforms as loading, until they render a response.
 * This way, we can make the submit button not clickable
 */
export function markFormsLoading() {
  $(document).on('submit', '.gform_wrapper form', e => {
    $(e.currentTarget).parent('.gform_wrapper').addClass('is-loading')
    $('html').addClass('is-page-loading');
  });
  $(document).on('gform_post_render', () => {
    $('.gform_wrapper').removeClass('is-loading');
    $('html').removeClass('is-page-loading');
  });
}


/**
 * Infinite posts
 */
export function loadMore() {
  const $container = $('[data-load-more-container]');

  // Mark the containers that don't have more items as already loaded
  $container.each((i, item) => {
    if ($(item).children().length < $(item).data('items-per-page')) {
      $(item).addClass('is-already-loaded');
    }
  });

  // When the load more button is clicked
  $(document).on('click', '[data-load-more]', (e) => loadMore(e));
  const loadMore = (e) => {
    const $container = $('[data-load-more-container]');
    const offset = $container.data('offset');
    const postsPerPage = $container.data('items-per-page');
    const nextOffset = parseInt(offset, 10) + parseInt(postsPerPage, 10);
    $container.addClass('is-loading');

    $.get(win.location.href, {'ajax': true, 'offset': nextOffset}, (data) => {
      const $items = $(data);

      console.log(data);

      if (data) {
        $container.append($items);
        console.log(nextOffset);
        $container.attr('data-offset', nextOffset);
      }

      $container.removeClass('is-loading');

      if (!data.trim() || $items.length < postsPerPage) {
        $container.addClass('is-all-loaded');
      }
    });
  };
}


/**
 * Slideshow accessibility: a pause/resume button button on slideshows, and focus adjustments
 */
export function slideshowA11y() {

  // Pause resume
  $(document).on('click', '.a11y-pause--cycle2', (e) => {
    const $this = $(e.currentTarget);
    const $slideshow = $this.parents('.slideshow');

    if ($this.is('.a11y-pause--play')) {
      $this.removeClass('a11y-pause--play');
      $slideshow.cycle('resume');
      $(window).trigger('screen-reader-notify', $this.data('play-message'));
      $this.attr('title', $this.find('.pause-label').text());
    } else {
      $this.addClass('a11y-pause--play');
      $slideshow.cycle('pause');
      $(window).trigger('screen-reader-notify', $this.data('pause-message'));
      $this.attr('title', $this.find('.play-label').text());
    }
  });

  // Focus to the slide whenever we select a pager item
  $(document).on('click', '.pager__item', (e) => {
    const index = $(e.currentTarget).attr('data-index');
    const slideTitle = $(`.slideshow__slide[data-index="${index}"] .title--slideshow`);
    setTimeout(() => slideTitle.focus(), 500);
  });

  // Keyboard nav for cycle2
  $(document).on('keyup', '.cycle-slideshow', (e) => {
    let $target = $(e.currentTarget);

    if (e.keyCode === 37)
      $target.cycle('prev');
    else if (e.keyCode === 39)
      $target.cycle('next');

    if (e.keyCode === 37 || e.keyCode === 39)
      e.stopPropagation();
  });
}

/**
 * Get the current section, by getting the element in the middle of the screen
 *
 * @param selector
 * @returns {*}
 */
export function getCurrentSectionFromPoint(selector = '.section') {
  const centerElement = document.elementFromPoint($(window).width() / 2, $(window).height() / 2);
  const $centerElement = $(centerElement);

  if ($centerElement.is(selector))
    return $centerElement;
  else {
    const parent = $centerElement.parents().filter(selector);
    if (parent.length)
      return parent;
    else
      return null;
  }
}

/**
 * Wrap-around value, when it doesn't fall within (min, max]
 *
 * @param val
 * @param min
 * @param max
 * @return Number
 */
export function wraparound(val, min, max) {
  if (val < min)
    return max - 1;
  else if (val >= max)
    return min;
  else
    return val;
}


/**
 * Find if two elements are overlapping
 */
export function isOverlapping($el1, $el2) {
  const getPos = ($el) => {
    return {
      left: $el.offset().left,
      top: $el.offset().top,
      bottom: $el.offset().top + $el.outerHeight(true),
      right: $el.offset().left + $el.outerWidth(true),
      height: $el.outerHeight(true),
      width: $el.outerWidth(true),
    }
  };

  const el1 = getPos($el1);
  const el2 = getPos($el2);

  return el1.bottom >= el2.top && el1.top <= el2.bottom &&
      el2.right >= el1.left && el1.left <= el2.right;
}

/**
 * Get the current section from calculating the exact position relative to the scrollPosition
 *
 * @param selector
 * @returns {*}
 */
export function getCurrentSectionFromSectionPos(selector = '.section', centerMargin = 0) {
  const centerPoint = $(window).scrollTop() + ($(window).height() / 2) + centerMargin;
  const $sections = $(selector);
  let currentItem = null;

  $sections.each(function () {
    const $section = $(this);
    const top = $section.offset().top;
    const bottom = top + $section.outerHeight(true);
    if ((centerPoint > top) && (bottom > centerPoint)) {
      currentItem = $section;
    }
  });

  return currentItem;
}

/**
 * Play/pause videos on click
 */
export function toggleVideoPlay() {
  $(document).on('click', 'video', function () {
    const video = $(this)[0];
    if (video.paused && video.readyState == 4)
      video.play();
    else
      video.pause();
  });
}

/**
 * Mark the header when it's scrolling down, so we can give
 * it another appearance, make it position: fixed and so on
 *
 * @param margin
 * @param headerSelector
 * @param downClass
 */
export function markScrolledDown(margin: Function | Number = 50, downClass = 'is-down', headerSelector = 'html') {
  const getMargin = typeof margin == 'function' ? margin : () => margin;
  const $header = $(headerSelector);

  if (!win.scrollDownMarkers)
    win.scrollDownMarkers = [];

  win.scrollDownMarkers.push({getMargin: getMargin, $header: $header, downClass: downClass});

  if (!win.markAllScrollDownMarkers) {
    win.markAllScrollDownMarkers = (scrollTop) => {
      win.scrollDownMarkers.forEach(marker => {
        marker.$header.toggleClass(marker.downClass, scrollTop > marker.getMargin());
      });
    };
  }

  const mark = () => {
    win.markAllScrollDownMarkers($(window).scrollTop())
  };

  $(window).off('load.markScrolledDown');
  $(window).on('load.markScrolledDown', () => mark());

  window.addEventListener('scroll', () => mark(), {passive: true});
  mark();
}

/**
 * Remove the hash from the location, without triggering a refresh
 */
export function removeHash() {
  history.pushState("", document.title, win.location.pathname + win.location.search);
}

/**
 * Marks the current section
 *
 * @param options
 */
export function markCurrentSection(options) {
  const defaults = {
    onCurrentSection: (section) => {
    },
    getCurrentSection: getCurrentSectionFromSectionPos,
    refreshRate: 500,
    selector: '.section',
    linksSelector: 'a.section-link, .menu-item',
    currentClass: 'is-current-section',
    sectionAttr: 'data-section',
    bookmarkSelector: '.bookmark',
    bodyAttr: 'data-current-section', debug: false,
  };

  const {
    onCurrentSection, getCurrentSection,
    refreshRate, selector, debug,
    linksSelector, currentClass, bookmarkSelector,
    sectionAttr, bodyAttr
  } = $.extend({}, defaults, options);

  const $sections = $(selector);
  const $links = $(linksSelector);

  // Throttle the onScroll, for performance
  let isScrolling = false;
  let $previousSection = $('');

  // Get Id from the section, or its bookmark, and return NaN
  // if no section is not found, so when comparing two of those NaN id's,
  // the result will be false.
  const getId = ($section) => {
    if ($section) {
      if (bookmarkSelector) {
        return $section.find(bookmarkSelector).attr('id');
      } else
        return $section.attr('id');
    } else {
      return NaN; // Use NaN since NaN != NaN
    }
  };

  const onScroll = () => {
    isScrolling = true
  };
  const doScroll = () => {
    if (isScrolling) {
      let $currentSection = getCurrentSection(selector);

      // Callback when change
      const currentId = getId($currentSection);
      const previousId = getId($previousSection);

      if (currentId != previousId) {
        onCurrentSection($currentSection);
        $previousSection = $currentSection;
      }

      if ($currentSection && $currentSection.length) {
        const filter = '[href*="#' + currentId + '"]';
        const $currentLink = $(linksSelector).filter(filter);

        $(linksSelector).removeClass(currentClass);
        $currentLink.addClass(currentClass);

        $sections.removeClass(currentClass);
        $currentSection.addClass(currentClass);

        if (debug) {
          console.log({$currentSection, $currentLink, filter});
        }

        $('body').attr(bodyAttr, $currentSection.attr(sectionAttr));
      }

      isScrolling = false;
    }
  };

  setInterval(doScroll, refreshRate);
  doScroll();

  $(window).on('scroll load resize', onScroll);
}

/**
 * Add a class to empty form elements, for styling
 *
 * @param selector
 */
export function markEmptyInputs(selector = 'input, select, textarea') {
  const mark = () => {
    $(selector).each(function () {
      if (!$(this).val())
        $(this).addClass('is-empty');
      else
        $(this).removeClass('is-empty');
    });
  };

  mark();
  $(document).on('change keyup', selector, mark);
}

/**
 * Mark the input's container with an is-focused class when it's in focus,
 * so we can properly style the focused mode. Especially useful for Ninja Forms 3
 *
 * @param selector
 * @param parent
 */
export function markFocusedInputContainer(selector = '.submit-wrap input[type="button"]',
                                          parent = '.submit-wrap') {
  $(document).on('focus', selector, (e) => {
    $(e.currentTarget).parents(parent).addClass('is-focused');
  });

  $(document).on('blur', selector, (e) => {
    $(e.currentTarget).parents(parent).removeClass('is-focused');
  });
}

/**
 * Mark items that are in the viewport. Relies on the jquery.viewport plugin
 *
 * @param itemSelector
 * @param stagger number Stagger items, in ms
 */
export function markItemsInViewport(itemSelector, stagger = null) {
  const mark = () => {
    const $enteredItems = $(itemSelector).filter(':in-viewport:not(.in-viewport)');

    if (stagger) {
      $enteredItems.each((i, item) => {
        setTimeout(() => {
          $(item).addClass('in-viewport');
        }, i * stagger);
      });
    } else {
      $enteredItems.addClass('in-viewport');
    }
  };

  mark();
  $(window).on('load scroll', () => mark());

}


/**
 * Add a class to the body when scrolling to the bottom,
 * so we can do stuff like hide the social menu
 */
export function markWhenAtBottomOfPage(margin = 0, footerSelector = '.footer') {
  const $body = $('body');
  const $footer = $(footerSelector);

  const mark = () => {
    const scrollDelta = $(document).height() - $(window).scrollTop() - $(window).height();

    if (scrollDelta <= (margin + $footer.height()))
      $body.addClass('is-at-bottom');
    else
      $body.removeClass('is-at-bottom');
  };

  mark();
  $(window).on('scroll resize', () => mark());
}

/**
 * Implements the in-fields-labels functionality for a given selector: that is, hides the label when it's clicked
 * or when the textbox is focused, shows it when it isn't and has no value
 */
export function inFieldLabels(formWrapper = '.gfield', labelSelector = 'label') {
  const init = () => {
    const inputSelector = 'input, textarea';

    $(formWrapper).each(function () {
      const $control = $(this).find(inputSelector);
      const $label = $(this).find(labelSelector);

      // If the input has text in it, hide the label
      if ($control.val()) $label.addClass('is-hidden');

      // If the label is clicked, hide the label
      $label.on('click', function () {
        $(this).addClass('is-hidden')
      });

      $control // Hide or show the label according to focus
          .on('input', function () {
            $(this).parents(formWrapper)
                .find('label').toggleClass('is-hidden is-with-value', !!$(this).val());
          })
          .focus(function () {
            $(this).parents(formWrapper).find('label').addClass('is-hidden');
          })
          .blur(function () {
            if (!$(this).val()) $(this).parents(formWrapper).find('label').removeClass('is-hidden');
          });
    });
  };

  init();
  $(window).on('gform_post_render', () => init());
}

/**
 * Add a "screen-reader-notify" event to the window,
 * that allows us to voice messages, for a11y purposes
 */
export function screenReaderNotifications() {
  let $notification = $('.screen-reader-notification');
  if (!$notification.length) {
    $notification = $(`<div class="screen-reader-notification visuallyhidden" aria-live="assertive"></div>`).prependTo('body');
  }

  const notify = (message) => {
    $notification.attr('role', 'alert').html(message);
  };
  $(window).on('screen-reader-notify', (e, message) => {
    notify(message);
  });

  // Notify on GForms errors, since Firefox doesn't seem to register them
  const onGForm = () => {
    if ($('#error').length) notify($('#error').text());
    if ($('.gform_confirmation_message').length) notify($('.gform_confirmation_message').text());
  };

  $(document).on('gform_post_render', () => onGForm());
  $(window).on('load', () => onGForm());

}

/**
 * VH fix for iOS, based on tips from https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
 */
export function fixVH() {
  const setVH = (param) => {
    const vh = win.innerHeight * 0.01;
    document.documentElement.style.setProperty('--' + param, `${vh}px`);
  };

  setVH('vh');
  setVH('rvh');

  $(window)
      .on('load', () => {
        setVH('vh');
        setVH('rvh');
      })
      .on('resize', () => {
        setVH('rvh');
      })
}

/**
 * Gets a CSS variable
 */
export function getCSSVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue('--' + name);
}

/**
 * Main menu toggle button, including a11y adjustments for keyboard etc.
 */
export function mainMenu() {
  function setFocus(selector) {
    const item = document.querySelector(selector);
    setTimeout(() => {
      if (item) item.focus();
    }, 250);
  }

  const $body = document.body;

  document.querySelector('.menu-toggle').addEventListener('click', () => {
    if ($body.classList.contains('is-menu-open')) {
      $body.classList.remove('is-menu-open');
      setFocus('#content');
    } else {
      $body.classList.add('is-menu-open');
      setFocus('.menu--main');
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'escape') {
      $body.classList.remove('is-menu-open');
      setFocus('#content');
    }
  });

  document.querySelector('.content').addEventListener('click', (e) => {
    $body.classList.remove('is-menu-open');
  });
}


/**
 * Lazy-load the videos and force autoplay,
 * so they won't load both the mobile and desktop at once,
 * which happens on some older phones.
 */
export async function lazyLoadVideos() {
  const loadVideos = async () => {
    const mobile = await isMobile();
    const videos = document.querySelectorAll('video[data-src]');

    videos.forEach((video: Element) => {
      const fitsCurrentScreen = (video.classList.contains('mobile') && mobile) ||
          (!video.classList.contains('mobile') && !mobile);

      const src = video.getAttribute('data-src');

      if (fitsCurrentScreen) {
        const videoElement = <HTMLVideoElement>video;
        video.setAttribute('src', src);
        console.log('Setting src',  src);
        video.addEventListener('canplay', () => {
          if(videoElement.paused) {
            videoElement.play();
            console.log('Playing video');
          }
        });
      } else {
        (<HTMLVideoElement>video).pause();
        console.log('Remove video', src);
        video.removeAttribute('src');
      }
    });
  };

  loadVideos();
}
