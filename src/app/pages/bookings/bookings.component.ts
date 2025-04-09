import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService, Booking as FirebaseBooking } from '../../services/firebase.service';
import { FirestoreService, Booking as FirestoreBooking } from '../../services/firestore.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: FirebaseBooking[] = [];
  recentBookings: FirestoreBooking[] = [];

  uid: string | null = null;
  loading: boolean = true;

  selectedBooking: FirebaseBooking | null = null;
  modifyingSeat: boolean = false;

  @ViewChild('seatSidenav') seatSidenav!: MatSidenav;

  constructor(
    private afAuth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private firestoreService: FirestoreService  
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.uid = user.uid;
        this.loadBookings();
        this.loadRecentBookings(); 
      } else {
        this.loading = false;
      }
    });
  }

  loadBookings(): void {
    if (!this.uid) return;
    this.loading = true;
    this.firebaseService.getBookingsByUser(this.uid).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Hiba a foglalások lekérésekor:', err);
        this.loading = false;
      }
    });
  }

  loadRecentBookings(): void {
    this.firestoreService.getRecentBookings().subscribe({
      next: (data) => {
        this.recentBookings = data;
      },
      error: (err) => {
        console.error('Hiba a legutóbbi foglalások lekérésekor:', err);
      }
    });
  }

  startModifySeat(booking: FirebaseBooking): void {
    this.selectedBooking = booking;
    this.modifyingSeat = true;
    setTimeout(() => {
      if (this.seatSidenav) {
        this.seatSidenav.open();
      }
    }, 0);
  }

  getCurrentSeats(): number[] {
    if (!this.selectedBooking) return [];
    return Array.isArray(this.selectedBooking.seat)
      ? this.selectedBooking.seat
      : [this.selectedBooking.seat];
  }

  async confirmModify(newSeats: number[]) {
    if (!this.selectedBooking) return;

    const bookingToUpdate = this.selectedBooking;

    try {
      await this.firebaseService.removeReservedSeats(bookingToUpdate.busId, bookingToUpdate.seat);
      await this.firebaseService.reserveSeats(bookingToUpdate.busId, newSeats);
      await this.firebaseService.updateBooking(bookingToUpdate.id!, { seat: newSeats });

      alert('Ülés(ek) sikeresen módosítva!');
    } catch (error) {
      console.error('Hiba az ülés módosításánál:', error);
      alert('Nem sikerült az ülés módosítása.');
    } finally {
      this.cancelModify();
      this.loadBookings();
    }
  }

  cancelModify() {
    this.modifyingSeat = false;
    this.selectedBooking = null;
    if (this.seatSidenav) {
      this.seatSidenav.close();
    }
  }

  async deleteBooking(booking: FirebaseBooking) {
    const confirmed = confirm('Biztosan törölni akarod ezt a foglalást?');
    if (!confirmed) return;

    try {
      await this.firebaseService.deleteBooking(booking.id!);
      await this.firebaseService.removeReservedSeats(booking.busId, booking.seat);

      alert('Foglalás sikeresen törölve!');
    } catch (error) {
      console.error('Hiba a foglalás törlésénél:', error);
      alert('Nem sikerült a foglalás törlése.');
    } finally {
      this.loadBookings();
    }
  }
}
