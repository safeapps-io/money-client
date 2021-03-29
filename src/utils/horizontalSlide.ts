import type { TransitionConfig } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export function horizontalSlide(
  node: Element,
  { duration = 500, delay = 0 }: { duration?: number; delay?: number },
): TransitionConfig {
  const style = getComputedStyle(node),
    opacity = +style.opacity + 1,
    width = parseFloat(style.width),
    padding_right = parseFloat(style.paddingRight),
    padding_left = parseFloat(style.paddingLeft),
    margin_right = parseFloat(style.marginRight),
    margin_left = parseFloat(style.marginLeft),
    border_right_width = parseFloat(style.borderRightWidth),
    border_left_width = parseFloat(style.borderLeftWidth);

  return {
    delay,
    easing: cubicOut,
    duration,
    css: t => {
      const forcedSlide = Math.min(t * 2, 1);

      return (
        `opacity: ${t * opacity - 1};` +
        `width: ${forcedSlide * width}px;` +
        `padding-right: ${forcedSlide * padding_right}px;` +
        `padding-left: ${forcedSlide * padding_left}px;` +
        `margin-right: ${forcedSlide * margin_right}px;` +
        `margin-left: ${forcedSlide * margin_left}px;` +
        `border-right-width: ${forcedSlide * border_right_width}px;` +
        `border-left-width: ${forcedSlide * border_left_width}px;`
      );
    },
  };
}
