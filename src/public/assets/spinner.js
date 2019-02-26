/* global document, Margin */

class Spinner {
  constructor(margin) {
    this.spinnerElement = document.createElement('img');
    this.initStyles(margin);
    document.body.appendChild(this.spinnerElement);
    this.spinnerElement.style.opacity = 0;
  }

  initStyles(margin) {
    const spinnerElement = this.spinnerElement;

    spinnerElement.setAttribute('src', '/img/spinner.gif');
    spinnerElement.style.position = 'absolute';
    spinnerElement.style.top = 'calc(50% - 30px)';
    spinnerElement.style.left = 'calc(50% - 30px)';
    spinnerElement.style.width = '60px';
    spinnerElement.style.height = '60px';
    spinnerElement.style.transition = 'opacity .7s';
    spinnerElement.style.opacity = 0;
    spinnerElement.style.pointerEvents = 'none';

    if (margin) {
      const { top, right, bottom, left } = margin;
      spinnerElement.style.margin = `${top}px ${right}px ${bottom}px ${left}px`;
    }
  }

  show() {
    setTimeout(() => (this.spinnerElement.style.opacity = 1), 0);
  }

  hide() {
    setTimeout(() => (this.spinnerElement.style.opacity = 0), 0);
  }
}
