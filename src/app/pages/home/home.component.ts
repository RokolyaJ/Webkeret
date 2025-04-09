import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  from: string = 'Budapest';
  to: string = 'Berlin';
  date: any = new Date();
  passengers: number = 1;

  constructor(private router: Router) {}

  onSearch() {
    let formattedDate: string;

    if (this.date instanceof Date) {
      const year = this.date.getFullYear();
      const month = (this.date.getMonth() + 1).toString().padStart(2, '0');
      const day = this.date.getDate().toString().padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else {
      formattedDate = this.date;
    }

    this.router.navigate(['/search'], {
      queryParams: {
        from: this.from,
        to: this.to,
        date: formattedDate,
        passengers: this.passengers
      }
    });
  }
}
