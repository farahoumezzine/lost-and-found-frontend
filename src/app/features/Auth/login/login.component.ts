import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage = '';
  showError = false;
  errorType: 'email' | 'password' | 'general' | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onSubmit(form: any): void {
    if (form.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.errorType = null;
      this.showError = false;

      const credentials = {
        email: form.value.email,
        password: form.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Erreur de connexion', error);
          this.showError = true;
          
          if (error.error.message.includes('utilisateur')) {
            this.errorType = 'email';
            this.errorMessage = 'Utilisateur non trouvé';
          } else if (error.error.message.includes('mot de passe')) {
            this.errorType = 'password';
            this.errorMessage = 'Mot de passe incorrect';
          } else {
            this.errorType = 'general';
            this.errorMessage = 'Erreur de connexion';
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

}
