import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../../services/item.service';
import { Item } from '../../../models/item.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  showDeleteConfirmation = false;
  itemToDelete: string | null = null;
  searchTerm: string = '';
  selectedStatus: string = '';

  constructor(
    private itemService: ItemService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (data) => {
        console.log('Loaded items:', data); // For debugging
        this.items = data;
        this.filteredItems = data;
      },
      error: (error) => {
        console.error('Error fetching items:', error);
      }
    });
  }

  deleteItem(id: string): void {
    this.itemToDelete = id;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.itemToDelete) {
      this.itemService.deleteItem(this.itemToDelete).subscribe({
        next: () => {
          this.loadItems();
          this.closeDeleteConfirmation();
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.closeDeleteConfirmation();
        }
      });
    }
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.itemToDelete = null;
  }

  editItem(id: string): void {
    console.log('Editing item with ID:', id);
    this.router.navigate(['/items/edit', id]);
  }

  public navigateToCreate(): void {
    this.router.navigate(['/items/create']);
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = searchTerm;
    this.filterItems();
  }

  onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.selectedStatus = status;
    this.filterItems();
  }

  private filterItems(): void {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.title.toLowerCase().includes(this.searchTerm) ||
        item.description.toLowerCase().includes(this.searchTerm) ||
        item.category.toLowerCase().includes(this.searchTerm) ||
        item.location.toLowerCase().includes(this.searchTerm);

      const matchesStatus = !this.selectedStatus || 
        item.status.toLowerCase() === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  navigateToChat(itemId: string, ownerId: string) {
    //Add test to chat 
    const testReceiverId = '65f2f645c0c0f3c8c9c6c123'; // Replace with any valid user ID from your database
    
    this.router.navigate(['/chat', itemId, testReceiverId]);
  }
}