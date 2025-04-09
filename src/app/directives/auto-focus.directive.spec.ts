import { ElementRef } from '@angular/core';
import { AutoFocusDirective } from './auto-focus.directive';

describe('AutoFocusDirective', () => {
  it('should create an instance', () => {
    const elementRefMock = new ElementRef(document.createElement('input'));
    const directive = new AutoFocusDirective(elementRefMock);
    expect(directive).toBeTruthy();
  });
});
