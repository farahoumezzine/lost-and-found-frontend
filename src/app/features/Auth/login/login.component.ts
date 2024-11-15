import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage = '';
  showSuccess: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}
    

  ngOnInit(): void {
    
  }

  onSubmit(form: any): void {
    if (form.valid) {
      this.loading = true;
      this.errorMessage = '';

      const credentials = {
        email: form.value.email,
        password: form.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
          this.router.navigate(['/items']); // Redirection après connexion
        },
        error: (error) => {
          console.error('Erreur de connexion', error);
          this.errorMessage = error.error.message || 'Erreur de connexion';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

}
