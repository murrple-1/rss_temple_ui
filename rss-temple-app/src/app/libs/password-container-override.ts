import { ElementRef, Renderer2 } from '@angular/core';

/*
  HACK: Clarity's Password Container doesn't support setting a tab-index on the "show/hide password" toggle
  (as of writing this) so we are editing the DOM ourselves
*/
export function passwordContainerOverride(
  elementRef: ElementRef<Element>,
  renderer: Renderer2,
) {
  const buttons = elementRef.nativeElement.querySelectorAll(
    'clr-password-container .clr-input-group button.clr-input-group-icon-action:not([tabindex])',
  );
  buttons.forEach(element => {
    renderer.setAttribute(element, 'tabindex', '-1');
  });
}
