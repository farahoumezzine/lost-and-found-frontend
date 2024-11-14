import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.interface';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:3000/api/items'; 

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl).pipe(
      tap(items => console.log('Fetched items:', items))
    );
  }

  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  createItem(item: FormData): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item).pipe(
      tap(response => console.log('Create response:', response))
    );
  }

  updateItem(id: string, item: FormData): Observable<Item> {
    console.log('Service - Updating item:', id);
    console.log('Service - Form data:', Array.from((item as any).entries()));
    
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item).pipe(
      tap(response => console.log('Update response:', response)),
      catchError(error => {
        console.error('Update error:', error);
        throw error;
      })
    );
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}