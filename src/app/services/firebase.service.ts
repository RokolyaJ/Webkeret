import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Booking {
  id?: string;
  uid: string;
  busId: string;
  from: string;
  to: string;
  date: string;
  seat: number[]; 
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  lastSearch: { from: string; to: string; date: string } | null = null;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {}

  async getAllBuses() {
    const snapshot = await firstValueFrom(this.db.object('buses').valueChanges());
    if (!snapshot) return [];
    return Object.entries(snapshot).map(([key, value]: [string, any]) => ({
      id: key,
      ...value
    }));
  }

  async getReservedSeats(busId: string): Promise<number[]> {
    const ref = this.db.object<number[]>(`buses/${busId}/reservedSeats`);
    const snapshot = await firstValueFrom(ref.valueChanges());
    return snapshot || [];
  }

  async reserveSeats(busId: string, seats: number[]): Promise<void> {
    const ref = this.db.object<number[]>(`buses/${busId}/reservedSeats`);
    const currentSeats = await this.getReservedSeats(busId);
    const updatedSeats = Array.from(new Set([...currentSeats, ...seats]));
    await ref.set(updatedSeats);
  }

  async removeReservedSeats(busId: string, seats: number[]): Promise<void> {
    const ref = this.db.object<number[]>(`buses/${busId}/reservedSeats`);
    const currentSeats = await this.getReservedSeats(busId);
    const updatedSeats = currentSeats.filter(s => !seats.includes(s));
    await ref.set(updatedSeats);
  }

  async getCurrentUser() {
    return await this.afAuth.currentUser;
  }

  async createBooking(booking: Booking) {
    return await this.afs.collection('bookings').add(booking);
  }

  async updateBooking(bookingId: string, data: Partial<Booking>) {
    return await this.afs.collection('bookings').doc(bookingId).update(data);
  }
  async deleteBooking(bookingId: string) {
    return await this.afs.collection('bookings').doc(bookingId).delete();
  }

  getBookingsByUser(uid: string) {
    return this.afs.collection<Booking>('bookings', ref =>
      ref.where('uid', '==', uid)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Booking;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
  setLastSearch(from: string, to: string, date: string) {
    this.lastSearch = { from, to, date };
  }
}
