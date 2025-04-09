import { ElementRef } from '@angular/core';
import { HoverHighlightDirective } from './hover-highlight.directive';

describe('HoverHighlightDirective', () => {
  it('should create an instance', () => {
    const elementRefMock = new ElementRef(document.createElement('div'));
    const directive = new HoverHighlightDirective(elementRefMock);
    expect(directive).toBeTruthy();
  });
});
