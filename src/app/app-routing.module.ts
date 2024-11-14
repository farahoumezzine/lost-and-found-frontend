import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemListComponent } from './features/item/item-list/item-list.component';
import { ItemFormComponent } from './features/item/item-form/item-form.component';
import { RegisterComponent } from './features/Auth/register/register.component';
import { LoginComponent } from './features/Auth/login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { ProfileComponent } from './features/Auth/profile/profile.component';
const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  { path: 'items', component: ItemListComponent },
  { path: 'items/create', component: ItemFormComponent },
  { path: 'items/edit/:id', component: ItemFormComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // { path: 'chat/:id', component: ChatComponent },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }