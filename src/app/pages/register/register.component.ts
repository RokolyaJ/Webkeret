import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  defaultPhotoURL = '/assets/icons/profile.png';

  hidePassword = true;           
  hideConfirmPassword = true;    

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('Kérlek, tölts ki minden mezőt!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('A jelszavak nem egyeznek!');
      return;
    }

    this.auth.register(this.email, this.password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          return user.updateProfile({
            displayName: this.name,
            photoURL: this.defaultPhotoURL 
          });
        }
        return Promise.resolve();
      })
      .then(() => {
        alert('Sikeres regisztráció! Most jelentkezz be.');
        this.router.navigate(['/login']);
      })
      .catch((error: any) => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Ez az email cím már használatban van!');
        } else {
          alert('Hiba: ' + (error.message || 'Ismeretlen hiba történt.'));
        }
      });
  }
}
