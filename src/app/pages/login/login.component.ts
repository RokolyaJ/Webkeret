import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email, this.password)
      .then(() => {
        alert('Sikeres bejelentkezés!');
        this.router.navigate(['/']);
      })
      .catch((error: any) => {
        alert('Hiba: ' + error.message);
      });
  }
}
