import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'seatCount'
})
export class SeatCountPipe implements PipeTransform {
  transform(value: number | number[]): string {
    if (Array.isArray(value)) {
      const count = value.length;
      return `${count} db hely`;
    } else {
      return `1 db hely`;
    }
  }
}
