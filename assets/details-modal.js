class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.detailsContainer = this.querySelector('details');
    this.summaryToggle = this.querySelector('summary');
    this.closeButton = this.querySelector('button[type="button"]');

    // Use arrow functions to maintain 'this' context
    this.detailsContainer.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.close();
    });
    this.summaryToggle.addEventListener('click', this.onSummaryClick.bind(this));
    this.closeButton.addEventListener('click', () => this.close());

    this.summaryToggle.setAttribute('role', 'button');
  }

  isOpen() {
    return this.detailsContainer.hasAttribute('open');
  }

  onSummaryClick(event) {
    event.preventDefault();
    this.isOpen() ? this.close() : this.open(event);
  }

  onBodyClick = (event) => {
    if (!this.contains(event.target) || event.target.classList.contains('modal-overlay')) {
      this.close(false);
    }
  }

  open(event) {
    this.detailsContainer.setAttribute('open', true);
    document.body.addEventListener('click', this.onBodyClick);
    document.body.classList.add('overflow-hidden');

    trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    );
  }

  close(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.summaryToggle : null);
    this.detailsContainer.removeAttribute('open');
    document.body.removeEventListener('click', this.onBodyClick);
    document.body.classList.remove('overflow-hidden');
  }
}

customElements.define('details-modal', DetailsModal);