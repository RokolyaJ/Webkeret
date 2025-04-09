import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'friendlyDate'
})
export class FriendlyDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    return formatDate(date, 'yyyy. MMMM d.', 'hu-HU');
  }
}
