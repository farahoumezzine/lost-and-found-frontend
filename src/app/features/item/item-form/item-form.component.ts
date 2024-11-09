import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ItemService } from '../../../services/item.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.itemForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.isEditMode = true;
      this.loadItem(this.itemId);
    }
  }

  loadItem(id: string): void {
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          status: item.status,
          email: item.contactInfo.email,
          phone: item.contactInfo.phone
        });
        this.imagePreview = item.image || null;
      },
      error: (error) => console.error('Error loading item:', error)
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    this.itemForm.patchValue({ image: file });
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
      const formData = new FormData();
      const formValue = this.itemForm.value;

      Object.keys(formValue).forEach(key => {
        if (key !== 'image') {
          formData.append(key, formValue[key]);
        }
      });

      if (this.itemForm.get('image')?.value) {
        formData.append('image', this.itemForm.get('image')?.value);
      }

      if (this.isEditMode && this.itemId) {
        this.itemService.updateItem(this.itemId, formData).subscribe({
          next: () => this.router.navigate(['/items']),
          error: (error) => console.error('Error updating item:', error)
        });
      } else {
        this.itemService.createItem(formData).subscribe({
          next: () => this.router.navigate(['/items']),
          error: (error) => console.error('Error creating item:', error)
        });
      }
  }

  onCancel(): void {
    this.router.navigate(['/items']);
  }
}
