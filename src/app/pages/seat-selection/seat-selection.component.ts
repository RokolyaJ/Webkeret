import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
interface BookingData {
  busId: string;
  uid: string;
  from: string;
  to: string;
  date: string;
  createdAt: Date;
  seat: number[];
}

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss']
})
export class SeatSelectionComponent implements OnInit {
  private _busId!: string;
  @Input() set busId(value: string) {
    this._busId = value;
    if (!this.firstInit) {
      this.reloadSeats();
    }
  }
  get busId(): string {
    return this._busId;
  }

  private _passengers: number = 1;
  @Input() set passengers(value: number) {
    console.log('Passengers set to:', value);
    this._passengers = value;
    this.maxSelectable = value; 
  }
  get passengers(): number {
    return this._passengers;
  }

  @Input() bookingId?: string;
  @Input() currentSeats?: number[];

  @Output() seatSelected = new EventEmitter<number[]>();  
  @Output() cancel = new EventEmitter<void>();   
  @Output() bookingCompleted = new EventEmitter<void>();
          

  seatMap: any[] = [];
  selectedSeats: number[] = [];
  reservedSeatsFromDB: number[] = [];
  maxSelectable: number = 1;
  private firstInit = true;

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.maxSelectable = this.passengers;   
    console.log('ngOnInit - passengers:', this.passengers, 'maxSelectable:', this.maxSelectable);
    this.generateSeatMap();
    await this.loadReservedSeats();
    this.firstInit = false;
  }

  async reloadSeats() {
    this.maxSelectable = this.passengers;   
    console.log('reloadSeats - passengers:', this.passengers, 'maxSelectable:', this.maxSelectable);
    this.generateSeatMap();
    await this.loadReservedSeats();
  }

  async loadReservedSeats() {
    this.reservedSeatsFromDB = await this.firebaseService.getReservedSeats(this.busId);

    this.seatMap.forEach(seat => {
      const isOccupied = this.reservedSeatsFromDB.includes(seat.id);

      if (this.currentSeats && this.currentSeats.includes(seat.id)) {
        seat.occupied = false;       
        seat.selected = true;      
      } else {
        seat.occupied = isOccupied;
        seat.selected = false;
      }
    });

    this.selectedSeats = this.seatMap.filter(s => s.selected).map(s => s.id); 
  }

  generateSeatMap() {
    const seatPositions = [
      { top: '170px', left: '60px' }, { top: '215px', left: '60px' },
      { top: '260px', left: '60px' }, { top: '305px', left: '60px' },
      { top: '350px', left: '60px' }, { top: '395px', left: '60px' },
      { top: '170px', left: '100px' }, { top: '215px', left: '100px' },
      { top: '260px', left: '100px' }, { top: '305px', left: '100px' },
      { top: '350px', left: '100px' }, { top: '395px', left: '100px' },
      { top: '80px', left: '170px' }, { top: '125px', left: '170px' },
      { top: '170px', left: '170px' }, { top: '215px', left: '170px' },
      { top: '260px', left: '170px' }, { top: '305px', left: '170px' },
      { top: '350px', left: '170px' }, { top: '395px', left: '170px' },
      { top: '80px', left: '210px' }, { top: '125px', left: '210px' },
      { top: '170px', left: '210px' }, { top: '215px', left: '210px' },
      { top: '260px', left: '210px' }, { top: '305px', left: '210px' },
      { top: '350px', left: '210px' }, { top: '395px', left: '210px' }
    ];

    this.seatMap = seatPositions.map((pos, index) => ({
      id: index + 1,
      top: pos.top,
      left: pos.left,
      selected: false,
      occupied: false
    }));
  }

  toggleSeat(seat: any) {
    if (seat.occupied) return;

    if (seat.selected) {
      seat.selected = false;
    } else {
      const currentlySelectedSeats = this.seatMap.filter(s => s.selected).length;
      if (currentlySelectedSeats < this.maxSelectable) {
        seat.selected = true;
      } else {
        alert(`Maximum ${this.maxSelectable} ülést választhatsz ki!`);
        return;
      }
    }
    this.selectedSeats = this.seatMap.filter(s => s.selected).map(s => s.id);
  }
  
  async confirmSeats() {
    if (this.selectedSeats.length !== this.maxSelectable) {
      alert(`Pontosan ${this.maxSelectable} helyet kell kiválasztani!`);
      return;
    }

    try {
      if (this.bookingId && this.currentSeats) {
        await this.firebaseService.removeReservedSeats(this.busId, this.currentSeats);
        await this.firebaseService.reserveSeats(this.busId, this.selectedSeats);
        await this.firebaseService.updateBooking(this.bookingId, { seat: this.selectedSeats });

        this.seatSelected.emit(this.selectedSeats);
        this.cancel.emit();
        this.bookingCompleted.emit();
        alert(`Ülések módosítva: ${this.currentSeats.join(', ')} → ${this.selectedSeats.join(', ')}`);
      } else {
        const user = await this.firebaseService.getCurrentUser();
        if (!user) {
          alert("Nem vagy bejelentkezve.");
          return;
        }

        if (!this.firebaseService.lastSearch) {
          alert("Hiányzó keresési adatok. Kérlek indíts új keresést.");
          return;
        }

        const bookingData: BookingData = {
          busId: this.busId,
          uid: user.uid,
          from: this.firebaseService.lastSearch.from,
          to: this.firebaseService.lastSearch.to,
          date: this.firebaseService.lastSearch.date,
          createdAt: new Date(),
          seat: this.selectedSeats
        };

        await this.firebaseService.reserveSeats(this.busId, this.selectedSeats);
        await this.firebaseService.createBooking(bookingData);
        this.seatSelected.emit(this.selectedSeats);
        this.cancel.emit();
        
        alert(`Sikeres foglalás: ${this.selectedSeats.join(', ')}`);
      }
    } catch (error) {
      console.error('Hiba az ülés mentésekor:', error);
      alert('Nem sikerült az ülés foglalása.');
    }
  }

  cancelSelection() {
    this.cancel.emit();
  }
}