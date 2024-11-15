import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemListComponent } from './features/item/item-list/item-list.component';
import { ItemFormComponent } from './features/item/item-form/item-form.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './features/chat/chat.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'items', component: ItemListComponent,canActivate: [AuthGuard]  },
  { path: 'items/create', component: ItemFormComponent,canActivate: [AuthGuard] },
  { path: 'items/edit/:id', component: ItemFormComponent,canActivate: [AuthGuard]  },
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // { path: 'chat/:id', component: ChatComponent },
  {
    path: 'chat/:itemId/:ownerId',
    component: ChatComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }