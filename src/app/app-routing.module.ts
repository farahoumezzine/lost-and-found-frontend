import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemListComponent } from './features/item/item-list/item-list.component';
import { ItemFormComponent } from './features/item/item-form/item-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  { path: 'items', component: ItemListComponent },
  { path: 'items/create', component: ItemFormComponent },
  { path: 'items/edit/:id', component: ItemFormComponent },
  // { path: 'chat/:id', component: ChatComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }