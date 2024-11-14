import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ItemService } from '../../../services/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    // Add any other modules you need for *ngFor, etc.
  ]
})
export class ItemFormComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode = false;
  imagePreview: string | null = null;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0];
  showSuccess = false;

  categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'documents', label: 'Documents' },
    { value: 'pets', label: 'Pets' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      category: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      status: ['', Validators.required],
      name: ['', [Validators.required, Validators.name]],

      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      image: [null]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadItem(id);
    }
  }

  createForm(): void {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      status: ['', Validators.required],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
      ]],
      phone: ['', [Validators.minLength(8), Validators.pattern(/^[0-9]+$/)]],  
          image: [null]
    });
  }

  loadItem(id: string): void {
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        console.log('Loaded item:', item);
        
        this.itemForm.patchValue({
          title: item.title || '',
          description: item.description || '',
          category: item.category || '',
          location: item.location || '',
          status: item.status?.toLowerCase() || '',
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
          name: item.contactInfo?.name || '',
          email: item.contactInfo?.email || '',
          phone: item.contactInfo?.phone || '',
          image: null
        });

        if (item.image) {
          this.imagePreview = 'http://localhost:3000' + item.image;
        }

        this.itemForm.markAsPristine();
        this.itemForm.markAsUntouched();
      },
      error: (error) => {
        console.error('Error loading item:', error);
        this.router.navigate(['/items']);
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.itemForm.patchValue({ image: file });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.itemForm.patchValue({ image: null });
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const formData = new FormData();
      
      // Create the item data object
      const itemData = {
        title: this.itemForm.get('title')?.value,
        description: this.itemForm.get('description')?.value,
        category: this.itemForm.get('category')?.value,
        location: this.itemForm.get('location')?.value,
        status: this.itemForm.get('status')?.value,
        date: this.itemForm.get('date')?.value,
        contactInfo: {
          email: this.itemForm.get('email')?.value,
          phone: this.itemForm.get('phone')?.value
        }
      };

      // Append each field individually instead of using itemData object
      Object.entries(itemData).forEach(([key, value]) => {
        if (key === 'contactInfo') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      // Append the image file if it exists
      const imageFile = this.itemForm.get('image')?.value;
      if (imageFile instanceof File) {
        formData.append('image', imageFile);
      }

      this.isSubmitting = true;
      const id = this.route.snapshot.paramMap.get('id');
      
      const request = this.isEditMode ? 
        this.itemService.updateItem(id!, formData) :
        this.itemService.createItem(formData);

      request.subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.showSuccess = true;
          this.isSubmitting = false;
          setTimeout(() => {
            this.showSuccess = false;
            this.router.navigate(['/items']);
          }, 2000);
        },
        error: (error) => {
          console.error('Form submission - Error:', error);
          this.isSubmitting = false;
          alert('Error updating item. Please try again.');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/items']);
  }
}
