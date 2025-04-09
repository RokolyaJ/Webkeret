import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { formatDate } from '@angular/common'; 

interface Bus {
  id: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  arrival: string;
  departurePlace: string;
  arrivalPlace: string;
  price: number;
  stops: number;
  seatsAvailable: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  from = '';
  to = '';
  date = '';
  passengers: number = 1;
  buses: Bus[] = [];
  loading = true;

  selectedBusId: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.from = params['from'] || '';
      this.to = params['to'] || '';

      if (params['date']) {
        const inputDate = new Date(params['date']);
        this.date = formatDate(inputDate, 'yyyy-MM-dd', 'en-US'); 
      }

      this.passengers = +params['passengers'] || 1;

      this.firebaseService.lastSearch = {
        from: this.from,
        to: this.to,
        date: this.date
      };

      await this.searchBuses();
    });
  }

  normalize(text: string | undefined | null): string {
    return text ? text.trim().toLowerCase() : '';
  }
  
  async searchBuses() {
    this.loading = true;
    const allBuses = await this.firebaseService.getAllBuses() as Bus[];

    this.buses = allBuses.filter(bus => {
      return (
        this.normalize(bus.from) === this.normalize(this.from) &&
        this.normalize(bus.to) === this.normalize(this.to) &&
        bus.date === this.date  
      );
    });

    this.loading = false;
  }

  openSeatSelection(busId: string) {
    this.selectedBusId = busId;
  }

  closeSeatSelection() {
    this.selectedBusId = null;
  }
}
