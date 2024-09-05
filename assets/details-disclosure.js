class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    // Use arrow functions to preserve 'this' context
    this.mainDetailsToggle.addEventListener('focusout', () => this.onFocusOut());
    this.mainDetailsToggle.addEventListener('toggle', () => this.onToggle());
  }

  onFocusOut() {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    // Lazy initialization of animations
    if (!this.animations) {
      this.animations = this.content.getAnimations();
    }

    const method = this.mainDetailsToggle.open ? 'play' : 'cancel';
    this.animations.forEach(animation => animation[method]());
  }

  close() {
    this.mainDetailsToggle.open = false;
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', 'false');
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    
    // Use requestAnimationFrame for layout calculations
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty(
        '--header-bottom-position-desktop',
        `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
      );
    });
  }
}

customElements.define('header-menu', HeaderMenu);