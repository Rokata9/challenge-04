"use strict";

// More info about implementation: https://developer.chrome.com/blog/performant-expand-and-collapse
class Expando {
  // $check-success-scale from _captcha.scss, some custom props like $checkbox-border and $checkbox-height can be moved to inline styles in html and retrieved by both CSS and JS
  _heightScale = 0.15625;
  _scale = 1;

  constructor() {
    this._elCheckmark = document.querySelector(".checkmark");
    this._elCheckmarkInverter = document.querySelector(".checkmark-inverter");

    this._createEaseAnimations();
  }

  expand() {
    if (this._isExpanded) {
      return;
    }
    this._isExpanded = true;
    this._applyAnimation({ expand: true });
  }

  collapse() {
    if (!this._isExpanded) {
      return;
    }
    this._isExpanded = false;
    this._applyAnimation({ expand: false });
  }

  toggle() {
    if (this._isExpanded) {
      return this.collapse();
    }

    this.expand();
  }

  _applyAnimation() {
    // this._elCheckmark.classList.remove("checkmark-checked");
    // this._elCheckmark.classList.remove("checkmark-inverter-checked");

    // Force a recalc styles here so the classes take hold.
    // window.getComputedStyle(this._elCheckmark).transform;

    this._elCheckmark.classList.add("checkmark-checked");
    this._elCheckmarkInverter.classList.add("checkmark-inverter-checked");
  }

  _createEaseAnimations() {
    let ease = document.querySelector(".ease");
    if (ease) {
      return ease;
    }

    ease = document.createElement("style");
    ease.classList.add("ease");

    const widthAnimation = [];
    const widthAnimationReversed = [];
    const heightAnimation = [];
    const heightAnimationReversed = [];
    for (let i = 0; i <= 100; i++) {
      const step = this._ease(i / 100);

      // Width animation.
      this._append({
        i,
        step,
        start: 0,
        end: this._scale,
        outerAnimation: widthAnimation,
        innerAnimation: widthAnimationReversed,
        isX: true
      });

      // Height animation.
      this._append({
        i,
        step,
        start: this._heightScale,
        end: this._scale,
        outerAnimation: heightAnimation,
        innerAnimation: heightAnimationReversed,
        isX: false
      });
    }

    ease.textContent = `
      @keyframes checkedWidthAnimation {
        ${widthAnimation.join("")}
      }

      @keyframes checkedWidthReversedAnimation {
        ${widthAnimationReversed.join("")}
      }
      
      @keyframes checkedHeightAnimation {
        ${heightAnimation.join("")}
      }
      
      @keyframes checkedHeightReversedAnimation {
        ${heightAnimationReversed.join("")}
      }`;

    document.head.appendChild(ease);
    return ease;
  }

  _append({ i, step, start, end, outerAnimation, innerAnimation, isX } = opts) {
    const scale = start + (end - start) * step;
    const scaleX = isX ? scale : 1;
    const scaleY = isX ? this._heightScale : scale;
    const invScaleX = scaleX === 0 ? 0 : 1 / scaleX;
    const invScaleY = 1 / scaleY;

    outerAnimation.push(`
      ${i}% {
        transform: scale(${scaleX}, ${scaleY});
      }`);

    innerAnimation.push(`
      ${i}% {
        transform: scale(${invScaleX}, ${invScaleY});
      }`);
  }

  _clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  _ease(v, pow = 4) {
    v = this._clamp(v, 0, 1);

    return 1 - Math.pow(1 - v, pow);
  }
}

const expando = new Expando();
const robotCheck = document.querySelector('.robot-check');
const circle = document.querySelector('.captcha-loading-circle');

robotCheck.addEventListener('click', () => {
  robotCheck.classList.add('checked');
  circle.classList.add('checked');
  expando.toggle();
});
