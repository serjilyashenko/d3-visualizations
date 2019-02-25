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
    // this.highPosition = 500;

    this.pointerLow = slider.querySelector('.d-slider .d-slider__pointer.d-slider__pointer_low');
    this.pointerHigh = slider.querySelector('.d-slider .d-slider__pointer.d-slider__pointer_high');

    this.onPointerLowStart = this.onPointerLowStart.bind(this);
    this.onPointerHighStart = this.onPointerHighStart.bind(this);
    this.onLowPointerMove = this.onLowPointerMove.bind(this);
    this.onHighPointerMove = this.onHighPointerMove.bind(this);
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
    this.pointerLow.addEventListener('mousedown', this.onPointerLowStart);
    this.pointerLow.addEventListener('touchstart', this.onPointerLowStart);

    this.pointerHigh.addEventListener('mousedown', this.onPointerHighStart);
    this.pointerHigh.addEventListener('touchstart', this.onPointerStart);

    this.setLowPosition(this.lowPosition);
    this.setHighCoordinate(this.highCoordinate);
  }

  onPointerLowStart() {
    this.controlArea.addEventListener('mousemove', this.onLowPointerMove);
    document.body.addEventListener('mouseup', this.onPointerEnd);
  }

  onPointerHighStart() {
    this.controlArea.addEventListener('mousemove', this.onHighPointerMove);
    document.body.addEventListener('mouseup', this.onPointerEnd);
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
    if (this.highCoordinate - this.lowCoordinate < this.minCoordinateDiff) {
      this.highCoordinate = this.lowCoordinate + this.minCoordinateDiff;
      this.setHighCoordinate(this.highCoordinate);
    }
    this.setLowCoordinate(this.lowCoordinate);
  }

  onHighPointerMove(e) {
    this.highCoordinate = this.getMoveHighCoordinate(e);
    if (this.highCoordinate - this.lowCoordinate < this.minCoordinateDiff) {
      this.lowCoordinate = this.highCoordinate - this.minCoordinateDiff;
      this.setLowCoordinate(this.lowCoordinate);
    }
    this.setHighCoordinate(this.highCoordinate);
  }

  /**
   * Apply new low coordinate to slider DOM element
   * @param {number} coordinate - The Low Slider coordinate (px)
   */
  setLowCoordinate(coordinate) {
    // console.log('range: ', this.lowPosition, this.highPosition);
    this.pointerLow.style.width = `${coordinate}px`;
  }

  /**
   * Apply new high coordinate to slider DOM element
   * @param {number} coordinate - The Low Slider coordinate (px)
   */
  setHighCoordinate(coordinate) {
    this.pointerHigh.style.width = `${this.width - coordinate}px`;
  }

  setLowPosition(position) {
    if (isNaN(Number(position))) {
      throw new Error('New position needs to be a number');
    }
    const p = this.lowPositionRange(position);
    this.lowPosition = p;
    const coordinate = this.convertToCoordinate(p);
    this.setLowCoordinate(coordinate);
  }

  convertToCoordinate(position) {
    const positionRange = this.maxPosition - this.minPosition;
    return Math.round((position * this.width) / positionRange);
  }

  convertToPosition(coordinate) {
    const positionRange = this.maxPosition - this.minPosition;
    return Math.round((coordinate * positionRange) / this.width);
  }

  onPointerEnd() {
    this.controlArea.removeEventListener('mousemove', this.onLowPointerMove);
    this.controlArea.removeEventListener('mousemove', this.onHighPointerMove);
    document.body.removeEventListener('mouseup', this.onPointerLowEnd);
    document.body.removeEventListener('mouseup', this.onPointerHighEnd);
  }
}
