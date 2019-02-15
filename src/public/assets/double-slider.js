/**
 * Class representing Range slider element
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} sliderId - The slider html element id without #
 */
class DoubleSlider {
  constructor(sliderId) {
    if (!sliderId) {
      throw new Error('Slider Constructor needs a slider HTML element!');
    }
    const slider = window.document.getElementById(sliderId);
    this.slider = slider;
    this.controlArea = slider.querySelector('.d-slider .d-slider__control-area');

    this.lowCoordinate = this.width - this.minRange; // TODO: make it like argument
    this.highCoordinate = this.width;
    this.pointerLow = slider.querySelector('.d-slider .d-slider__pointer.d-slider__pointer_low');
    this.pointerHigh = slider.querySelector('.d-slider .d-slider__pointer.d-slider__pointer_high');
    this.onPointerLowStart = this.onPointerLowStart.bind(this);
    this.onPointerHighStart = this.onPointerHighStart.bind(this);
    this.onPointerLowMove = this.onPointerLowMove.bind(this);
    this.onPointerHighMove = this.onPointerHighMove.bind(this);
    this.onPointerEnd = this.onPointerEnd.bind(this);
    this.init();
  }

  /**
   * Limit x using min and max limits
   * @param {number} x
   * @param {number} min - The low limit
   * @param {number} max - The hight limit
   * @returns {number} - The limited value
   */
  static range(x, min = 0, max = 100) {
    const lowLimited = Math.max(x, min);
    return Math.min(lowLimited, max);
  }

  get width() {
    return this.controlArea.clientWidth;
  }

  get areaLeft() {
    return this.controlArea.getBoundingClientRect().left;
  }

  get minRange() {
    return 70;
  }

  /**
   * Initiate all slider handlers
   */
  init() {
    this.pointerLow.addEventListener('mousedown', this.onPointerLowStart);
    this.pointerLow.addEventListener('touchstart', this.onPointerLowStart);

    this.pointerHigh.addEventListener('mousedown', this.onPointerHighStart);
    this.pointerHigh.addEventListener('touchstart', this.onPointerStart);

    this.setPointerLow();
    this.setPointerHigh();
  }

  onPointerLowStart() {
    this.controlArea.addEventListener('mousemove', this.onPointerLowMove);
    document.body.addEventListener('mouseup', this.onPointerEnd);
  }

  onPointerHighStart() {
    this.controlArea.addEventListener('mousemove', this.onPointerHighMove);
    document.body.addEventListener('mouseup', this.onPointerEnd);
  }

  getMoveLowCoordinate(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return DoubleSlider.range(clientX - this.areaLeft, 0, this.width - this.minRange);
  }

  getMoveHighCoordinate(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return DoubleSlider.range(clientX - this.areaLeft, this.minRange, this.width);
  }

  onPointerLowMove(e) {
    this.lowCoordinate = this.getMoveLowCoordinate(e);
    if (this.highCoordinate - this.lowCoordinate < this.minRange) {
      this.highCoordinate = this.lowCoordinate + this.minRange;
      this.setPointerHigh();
    }
    this.setPointerLow();
  }

  onPointerHighMove(e) {
    this.highCoordinate = this.getMoveHighCoordinate(e);
    if (this.highCoordinate - this.lowCoordinate < this.minRange) {
      this.lowCoordinate = this.highCoordinate - this.minRange;
      this.setPointerLow();
    }
    this.setPointerHigh();
  }

  setPointerLow() {
    this.pointerLow.style.width = `${this.lowCoordinate}px`;
  }

  setPointerHigh() {
    this.pointerHigh.style.width = `${this.width - this.highCoordinate}px`;
  }

  onPointerEnd() {
    this.controlArea.removeEventListener('mousemove', this.onPointerLowMove);
    this.controlArea.removeEventListener('mousemove', this.onPointerHighMove);
    document.body.removeEventListener('mouseup', this.onPointerLowEnd);
    document.body.removeEventListener('mouseup', this.onPointerHighEnd);
  }
}
