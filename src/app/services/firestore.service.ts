import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Booking {
  id?: string;
  uid: string;
  from: string;
  to: string;
  date: string;
  seat: number;
  busId: string;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private afs: AngularFirestore) {}

  getBookingsByUser(uid: string): Observable<Booking[]> {
    return this.afs.collection<Booking>('bookings', ref =>
      ref
        .where('uid', '==', uid)           
        .orderBy('date', 'desc')            
        .limit(10)                          
    ).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Booking;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getRecentBookings(): Observable<Booking[]> {
    return this.afs.collection<Booking>('bookings', ref =>
      ref
        .orderBy('createdAt', 'desc')        
        .limit(5)                            
    ).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Booking;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  addBooking(booking: Booking) {
    booking.createdAt = new Date();
    return this.afs.collection('bookings').add(booking);
  }

  updateBooking(bookingId: string, updates: Partial<Booking>) {
    return this.afs.collection('bookings').doc(bookingId).update(updates);
  }

  deleteBooking(bookingId: string) {
    return this.afs.collection('bookings').doc(bookingId).delete();
  }
}
