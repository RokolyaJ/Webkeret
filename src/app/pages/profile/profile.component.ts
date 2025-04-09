import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  defaultProfilePic = '/assets/images/profile.png';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  saving = false;

  constructor(private auth: AuthService, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
  }

  async changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      alert('Tölts ki minden mezőt!');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      alert('Az új jelszavak nem egyeznek!');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }

    try {
      this.saving = true;
      const user = await this.afAuth.currentUser;

      if (user && user.email) {
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          this.currentPassword
        );

        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(this.newPassword);

        alert('Jelszó sikeresen frissítve!');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      }
    } catch (error: any) {
      alert('Hiba: ' + (error.message || 'Ismeretlen hiba'));
    } finally {
      this.saving = false;
    }
  }
}
