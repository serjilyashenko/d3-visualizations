/**
 * Class representing margin indents
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class Margin {
  /**
   * Create a margin indents object
   * @param {number} top - The top margin
   * @param {number} right - The right margin
   * @param {number} bottom - The bottom margin
   * @param {number} left - The left margin
   */
  constructor(top, right, bottom, left) {
    this.top = top;
    this.right = right || top;
    this.bottom = bottom || top;
    this.left = left || right || top;
  }
}
