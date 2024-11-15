import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserRegister, ApiResponse } from '../models/user.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) { }
// register user
  register(userData: UserRegister): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/auth/signup`, userData);
  }
// login user

login(credentials: { email: string; password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/login`, credentials)
    .pipe(
      tap((response: any) => {
        // Stockage du token dans localStorage
        if (response.token && response.user) {
          const { id, username, email, password, role } = response.user;
         // Stocke chaque information séparément dans le localStorage
         localStorage.setItem('token', response.token);
         localStorage.setItem('_id', JSON.stringify(id));
         localStorage.setItem('username', JSON.stringify(username));
         localStorage.setItem('email', JSON.stringify(email));
         localStorage.setItem('role', JSON.stringify(role));
         
        }
        this.isLoggedInSubject.next(true);
      })
    );
}

// logout user
logout(): void {
  localStorage.clear();
  this.isLoggedInSubject.next(false);
}

// ... existing code ...
// get storage
private getStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null;
}
// is logged in
isLoggedIn(): boolean {
  const storage = this.getStorage();
  if (!storage) return false;
  
  const token = storage.getItem('token');
  return !!token;
}

getToken(): string | null {
  const storage = this.getStorage();
  return storage ? storage.getItem('token') : null;
}
// set token
setToken(token: string): void {
  const storage = this.getStorage();
  if (storage) {
    storage.setItem('token', token);
  }
}

removeToken(): void {
  const storage = this.getStorage();
  if (storage) {
    storage.removeItem('token');
  }
}

updateUser(newprofile: any) {
  // Récupérer l'ID depuis le localStorage
  const userId = localStorage.getItem('_id');
    // Retirer les guillemets si présents
    
    const cleanUserId = userId ? userId.replace(/"/g, '') : '';
    return this.http.put(`${this.apiUrl}/users/update/${cleanUserId}`, newprofile);
    //return this.http.put(this.apiUrl + '/users/update/' + newprofile._id, newprofile);
}

// sup utilisateur
// ... reste du code ...

deleteUser(userId: string) {
  return this.http.delete(`${this.apiUrl}/users/delete/${userId}`);
}


}
