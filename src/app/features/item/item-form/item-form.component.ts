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
  ) {}

  ngOnInit(): void {
    this.createForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadItem(id);
    }
  }

  createForm(): void {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      category: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      status: ['', Validators.required],
      contactInfo: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
        ]],
        phone: ['', [
          Validators.pattern('^[0-9]{8,}$')
        ]]
      }),
      image: [null]
    });
  }

  loadItem(id: string): void {
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        console.log('Loaded item:', item);
        
        this.itemForm.patchValue({
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          status: item.status,
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
          contactInfo: {
            name: item.contactInfo?.name || '',
            email: item.contactInfo?.email || '',
            phone: item.contactInfo?.phone || ''
          }
        });

        if (item.image) {
          this.imagePreview = 'http://localhost:3000' + item.image;
        }
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

  isFieldInvalid(fieldPath: string): boolean {
    const field = fieldPath.split('.').reduce((form: any, path) => {
      return form?.get(path);
    }, this.itemForm);
    
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const formData = new FormData();
      const formValues = this.itemForm.value;
      
      // Append basic fields
      formData.append('title', formValues.title);
      formData.append('description', formValues.description);
      formData.append('category', formValues.category);
      formData.append('location', formValues.location);
      formData.append('status', formValues.status);
      formData.append('date', formValues.date);
      
      // Append contact info
      const contactInfo = {
        name: formValues.contactInfo.name,
        email: formValues.contactInfo.email,
        phone: formValues.contactInfo.phone || ''
      };
      
      // Log the contact info for debugging
      console.log('Contact Info being sent:', contactInfo);
      
      formData.append('contactInfo', JSON.stringify(contactInfo));

      // Append image if it exists
      const imageFile = this.itemForm.get('image')?.value;
      if (imageFile instanceof File) {
        formData.append('image', imageFile);
      }

      this.isSubmitting = true;

      const request = this.isEditMode ? 
        this.itemService.updateItem(this.route.snapshot.paramMap.get('id')!, formData) :
        this.itemService.createItem(formData);

      request.subscribe({
        next: (response) => {
          console.log('Server response:', response); // Add this for debugging
          this.showSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/items']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error saving item:', error);
          this.isSubmitting = false;
          alert('Error saving item. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.itemForm);
    }
  }

  // Helper method to show validation errors
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/items']);
  }
}
