/**
 * Class representing slider element
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class Slider {
  /**
   * Create slider instance
   * @param {string} slider - The slider html element id
   */
  constructor(sliderId) {
    if (!slider) {
      throw new Error('Slider Constructor needs a slider HTML element!');
    }
    this.slider = window.document.getElementById(sliderId);
    this.controlArea = slider.querySelector('.slider .slider__control-area');
    this.pointer = slider.querySelector('.slider .slider__pointer');
    this.handleMove = this._handleMove.bind(this);
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

  /**
   * Initiate all slider handlers
   */
  init() {
    this.slider.addEventListener('click', this.handleMove);

    this.slider.addEventListener('mousedown', () => {
      window.addEventListener('mousemove', this.handleMove);
      this.controlArea.classList.add('slider__control-area_transition-stop');
    });

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', this.handleMove);
      this.controlArea.classList.remove('slider__control-area_transition-stop');
    });

    this.slider.addEventListener('touchstart', () => {
      window.addEventListener('touchmove', this.handleMove);
      this.controlArea.classList.add('slider__control-area_transition-stop');
    });

    window.addEventListener('touchend', () => {
      window.removeEventListener('touchmove', this.handleMove);
      this.controlArea.classList.remove('slider__control-area_transition-stop');
    });
  }

  /**
   * Subscribe on slider change
   * @param {onChangeCallback} callback - The callback that handles slider state change
   */
  onChange(callback) {
    this.callback = callback;
  }

  /**
   * Set slider state using coordinate
   * @param {number} coordinate - The Slider coordinate (px)
   */
  setCoordinate(coordinate) {
    this.pointer.style.left = `${coordinate}px`;
  }

  /**
   * Set slider state using percent position
   * @param {number} position - The new position in percents (%)
   */
  setPosition(position) {
    if (isNaN(Number(position))) {
      throw new Error('New position needs to be a number');
    }
    const p = Slider.range(position);
    const coordinate = this._convertToCoordinate(p);
    this.setCoordinate(coordinate);
  }

  /**
   * Get slider percent position from mouse event
   * @param {MouseEvent} e - The mouse event
   * @returns {number} - The slider percent position
   */
  _getPosition(e) {
    const coordinate = this._getCoordinate(e);
    return this._convertToPosition(coordinate);
  }

  /**
   * Get Slider coordinate from mouse event
   * @param {MouseEvent} e - The mouse event
   * @returns {number} - The slider coordinate (px)
   */
  _getCoordinate(e) {
    const width = this.controlArea.clientWidth;
    const areaLeft = this.controlArea.getBoundingClientRect().left;
    return Slider.range(e.clientX - areaLeft, 0, width);
  }

  /**
   * Convert the Slider coordinate to the slider position
   * @param {number} coordinate - The slider coordinate (px)
   * @returns {number} - The slider percent position (%)
   */
  _convertToPosition(coordinate) {
    const width = this.controlArea.clientWidth || 1;
    return (coordinate * 100) / width;
  }

  /**
   * Convert the Slider position to the slider coordinate
   * @param {number} coordinate - The slider position (%)
   * @returns {number} - The slider percent coordinate (px)
   */
  _convertToCoordinate(position) {
    const width = this.controlArea.clientWidth;
    return Math.round((position * width) / 100);
  }

  /**
   * Move the Slider Pointer to mouse coordinate
   * @param {MouseEvent} e - The mouse event
   */
  _handleMove(e) {
    // TODO: It is not a great solution. It needs to be refactored.
    if (e.touches) {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }
    const coordinate = this._getCoordinate(e);
    this.setCoordinate(coordinate);
    if (typeof this.callback === 'function') {
      const position = this._getPosition(e);
      this.callback(position);
    }
  }
}
