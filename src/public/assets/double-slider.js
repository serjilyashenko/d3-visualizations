/**
 * Class representing Range slider element
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} sliderId - The slider html element id without #
 */
class DoubleSlider {
  constructor(sliderId, minPosition, maxPosition, minPositionDiff) {
    if (!sliderId) {
      throw new Error('Slider Constructor needs a slider HTML element!');
    }
    const slider = window.document.getElementById(sliderId);
    this.slider = slider;
    this.controlArea = slider.querySelector('.d-slider .d-slider__control-area');

    this.minPosition = minPosition;
    this.maxPosition = maxPosition;
    this.minPositionDiff = minPositionDiff || 70;
    this.lowPosition = minPosition;
    this.highPosition = maxPosition;

    this.pointerLow = slider.querySelector('.d-slider .d-slider__pointer.d-slider__pointer_low');
    this.pointerHigh = slider.querySelector('.d-slider .d-slider__pointer.d-slider__pointer_high');

    this.onPointerLowStart = this.onPointerLowStart.bind(this);
    this.onPointerHighStart = this.onPointerHighStart.bind(this);
    this.onLowPointerMove = this.onLowPointerMove.bind(this);
    this.onHighPointerMove = this.onHighPointerMove.bind(this);
    this.onPointerEnd = this.onPointerEnd.bind(this);

    this.callbacks = new Set();
    this.disabled = false;

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

  get lowCoordinate() {
    return this.convertToCoordinate(this.lowPosition);
  }

  set lowCoordinate(coordinate) {
    this.lowPosition = this.convertToPosition(coordinate);
  }

  get highCoordinate() {
    return this.convertToCoordinate(this.highPosition);
  }

  set highCoordinate(coordinate) {
    this.highPosition = this.convertToPosition(coordinate);
  }

  get minCoordinateDiff() {
    return this.convertToCoordinate(this.minPositionDiff);
  }

  get width() {
    return this.controlArea.clientWidth;
  }

  get areaLeft() {
    return this.controlArea.getBoundingClientRect().left;
  }

  /**
   * Initiate all slider handlers
   */
  init() {
    window.addEventListener('resize', this.onResize.bind(this));

    this.pointerLow.addEventListener('mousedown', this.onPointerLowStart);
    this.pointerLow.addEventListener('touchstart', this.onPointerLowStart);

    this.pointerHigh.addEventListener('mousedown', this.onPointerHighStart);
    this.pointerHigh.addEventListener('touchstart', this.onPointerHighStart);

    this.applyCoordinates();
  }

  lowCoordinateRange(coordinate) {
    return DoubleSlider.range(coordinate, 0, this.width - this.minCoordinateDiff);
  }

  highCoordinateRange(coordinate) {
    return DoubleSlider.range(coordinate, this.minCoordinateDiff, this.width);
  }

  lowPositionRange(position) {
    const maxLowPosition = this.maxPosition - this.minPosition - this.minPositionDiff;
    return DoubleSlider.range(position, this.minPosition, maxLowPosition);
  }

  highPositionRange(position) {
    return DoubleSlider.range(position, this.minPositionDiff, this.maxPosition);
  }

  onResize() {
    this.applyCoordinates();
  }

  onPointerLowStart() {
    if (this.disabled) {
      return;
    }
    this.controlArea.classList.add('active');
    this.controlArea.addEventListener('mousemove', this.onLowPointerMove);
    this.controlArea.addEventListener('touchmove', this.onLowPointerMove);
    document.body.addEventListener('mouseup', this.onPointerEnd);
    document.body.addEventListener('touchend', this.onPointerEnd);
  }

  onPointerHighStart() {
    if (this.disabled) {
      return;
    }
    this.controlArea.classList.add('active');
    this.controlArea.addEventListener('mousemove', this.onHighPointerMove);
    this.controlArea.addEventListener('touchmove', this.onHighPointerMove);
    document.body.addEventListener('mouseup', this.onPointerEnd);
    document.body.addEventListener('touchend', this.onPointerEnd);
  }

  getMoveLowCoordinate(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return this.lowCoordinateRange(clientX - this.areaLeft);
  }

  getMoveHighCoordinate(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return this.highCoordinateRange(clientX - this.areaLeft);
  }

  onLowPointerMove(e) {
    this.lowCoordinate = this.getMoveLowCoordinate(e);
    this.correctHighCoordinate();
    this.applyCoordinates();
    this.notifyChange();
  }

  onHighPointerMove(e) {
    this.highCoordinate = this.getMoveHighCoordinate(e);
    this.correctLowCoordinate();
    this.applyCoordinates();
    this.notifyChange();
  }

  onPointerEnd() {
    this.controlArea.classList.remove('active');
    this.controlArea.removeEventListener('mousemove', this.onLowPointerMove);
    this.controlArea.removeEventListener('touchmove', this.onLowPointerMove);
    this.controlArea.removeEventListener('mousemove', this.onHighPointerMove);
    this.controlArea.removeEventListener('touchmove', this.onHighPointerMove);
    document.body.removeEventListener('mouseup', this.onPointerLowEnd);
    document.body.removeEventListener('touchend', this.onPointerLowEnd);
    document.body.removeEventListener('mouseup', this.onPointerHighEnd);
    document.body.removeEventListener('touchend', this.onPointerHighEnd);
  }

  correctLowCoordinate() {
    if (this.highCoordinate - this.lowCoordinate < this.minCoordinateDiff) {
      this.lowCoordinate = this.highCoordinate - this.minCoordinateDiff;
    }
  }

  correctHighCoordinate() {
    if (this.highCoordinate - this.lowCoordinate < this.minCoordinateDiff) {
      this.highCoordinate = this.lowCoordinate + this.minCoordinateDiff;
    }
  }

  setLowPosition(position) {
    if (isNaN(Number(position))) {
      throw new Error('New position needs to be a number');
    }
    const lp = this.lowPositionRange(position);
    this.lowCoordinate = this.convertToCoordinate(lp);

    this.correctHighCoordinate();
    this.applyCoordinates();
  }

  setHighPosition(position) {
    if (isNaN(Number(position))) {
      throw new Error('New position needs to be a number');
    }
    const hp = this.highPositionRange(position);
    this.highCoordinate = this.convertToCoordinate(hp);

    this.correctLowCoordinate();
    this.applyCoordinates();
  }

  setPositionRange(lowPosition, highPosition) {
    const lp = this.lowPositionRange(lowPosition);
    const hp = this.highPositionRange(highPosition);

    this.lowCoordinate = this.convertToCoordinate(lp);
    this.highCoordinate = this.convertToCoordinate(hp);

    this.correctHighCoordinate();
    this.applyCoordinates();
  }

  /**
   * Apply new low coordinate to slider DOM element
   * @param {number} coordinate - The Low Slider coordinate (px)
   */
  applyLowCoordinate() {
    this.pointerLow.style.width = `${this.lowCoordinate}px`;
  }

  /**
   * Apply new high coordinate to slider DOM element
   * @param {number} coordinate - The Low Slider coordinate (px)
   */
  applyHighCoordinate() {
    this.pointerHigh.style.width = `${this.width - this.highCoordinate}px`;
  }

  applyCoordinates() {
    this.applyLowCoordinate();
    this.applyHighCoordinate();
  }

  convertToCoordinate(position) {
    const positionRange = this.maxPosition - this.minPosition;
    return Math.round((position * this.width) / positionRange);
  }

  convertToPosition(coordinate) {
    const positionRange = this.maxPosition - this.minPosition;
    return Math.round((coordinate * positionRange) / this.width);
  }

  enable() {
    this.disabled = false;
  }

  disable() {
    this.disabled = true;
  }

  onChange(cb) {
    if (typeof cb !== 'function') {
      return () => {};
    }
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  unsubscribe(cb) {
    this.callbacks.delete(cb);
  }

  notifyChange() {
    this.callbacks.forEach(cb => {
      if (typeof cb === 'function') {
        cb(this.lowPosition, this.highPosition);
      }
    });
  }
}
