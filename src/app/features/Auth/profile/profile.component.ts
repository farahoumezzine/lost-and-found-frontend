import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  _id:any
  showDeleteConfirmation = false;
  showSuccess = false;

  user = {
    _id: '',
    username: '',
    email: '',
    password: ''
  };
  
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    //this.user = JSON.parse(localStorage.getItem('User') || '{}');
  }
  ngOnInit(): void {
    this.user._id = JSON.parse(localStorage.getItem('_id') || '""');
    this.user.username = JSON.parse(localStorage.getItem('username') || '""');
    this.user.email = JSON.parse(localStorage.getItem('email') || '""');
    this.user.password = JSON.parse(localStorage.getItem('password') || '""');
  }

  onLogout(): void {
    this.authService.logout();
  this.router.navigate(['/login']);
  }
 
  updateUser(newUsername: string, newEmail: string): void {
    if (newUsername == "" || newEmail == "") {
      this.showSuccess = false;
    } else {
      const newUser = {
        _id: this.user._id,
        username: newUsername,
        email: newEmail
      };

      this.authService.updateUser(newUser).subscribe({
        next: (res: any) => {
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
          }, 2000);
          
          localStorage.setItem('username', JSON.stringify(newUsername));
          localStorage.setItem('email', JSON.stringify(newEmail));
          this.user.username = newUsername;
          this.user.email = newEmail;
        },
        error: (err) => {
          console.error('Error during update:', err);
          this.showSuccess = false;
        }
      });
    }
  }

  // ... reste du code ...

  delete(): void {
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    const userId = JSON.parse(localStorage.getItem('_id') || '""');
    
    this.authService.deleteUser(userId).subscribe({
      next: () => {
        alert('Your account has been successfully deleted. You will be redirected to the registration page.');
        this.authService.logout();
        this.router.navigate(['/register']);
      },
      error: (err) => {
        console.error('Error during deletion:', err);
        alert('An error occurred while trying to delete your account. Please try again later.');
      }
    });
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false;
  }
  
}
