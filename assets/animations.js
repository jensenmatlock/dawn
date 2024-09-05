// Constants moved to the top for better visibility and maintainability
const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';
const SCROLL_ANIMATION_DESIGN_MODE_CLASSNAME = 'scroll-trigger--design-mode';

// Scroll in animation logic
function onIntersection(entries, observer) {
  entries.forEach((entry, index) => {
    const elementTarget = entry.target;
    if (entry.isIntersecting) {
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade')) {
          elementTarget.style.setProperty('--animation-order', index);
        }
      }
      observer.unobserve(elementTarget);
    } else {
      elementTarget.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      elementTarget.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document, isDesignModeEvent = false) {
  const animationTriggerElements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  if (isDesignModeEvent) {
    animationTriggerElements.forEach((element) => {
      element.classList.add(SCROLL_ANIMATION_DESIGN_MODE_CLASSNAME);
    });
    return;
  }

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px',
  });
  animationTriggerElements.forEach((element) => observer.observe(element));
}

// Zoom in animation logic
function initializeScrollZoomAnimationTrigger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  const scaleAmount = 0.2 / 100;

  animationTriggerElements.forEach((element) => {
    let elementIsVisible = false;
    const observer = new IntersectionObserver((entries) => {
      elementIsVisible = entries[0].isIntersecting;
    });
    observer.observe(element);

    const updateZoomRatio = () => {
      if (!elementIsVisible) return;
      element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
    };

    updateZoomRatio();
    window.addEventListener('scroll', throttle(updateZoomRatio), { passive: true });
  });
}

function percentageSeen(element) {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const elementPositionY = element.getBoundingClientRect().top + scrollY;
  const elementHeight = element.offsetHeight;

  if (elementPositionY > scrollY + viewportHeight) {
    return 0;
  } else if (elementPositionY + elementHeight < scrollY) {
    return 100;
  }

  const distance = scrollY + viewportHeight - elementPositionY;
  const percentage = distance / ((viewportHeight + elementHeight) / 100);
  return Math.round(percentage);
}

// Ensure throttle function is defined
function throttle(func, limit = 250) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  initializeScrollZoomAnimationTrigger();
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => initializeScrollAnimationTrigger(event.target, true));
  document.addEventListener('shopify:section:reorder', () => initializeScrollAnimationTrigger(document, true));
}