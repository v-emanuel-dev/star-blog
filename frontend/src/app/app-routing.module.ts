import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../app/auth/auth.guard';
import { BlogCreateComponent } from '../app/components/blog-create/blog-create.component';
import { BlogEditComponent } from '../app/components/blog-edit/blog-edit.component';
import { BlogListComponent } from '../app/components/blog-list/blog-list.component';
import { LoginComponent } from '../app/components/login/login.component';
import { RegisterComponent } from '../app/components/register/register.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UsersComponent } from './components/admin/users/users.component'; // Importando AdminDashboardComponent

const routes: Routes = [
  { path: '', redirectTo: '/blog', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/create', component: BlogCreateComponent, canActivate: [AuthGuard] },
  { path: 'blog/edit/:id', component: BlogEditComponent, canActivate: [AuthGuard] },
  { path: 'blog/post/:id', component: BlogDetailComponent },
  { path: 'user', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: UsersComponent, canActivate: [AuthGuard], data: { requiresAdmin: true } } // Rota para admin
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
