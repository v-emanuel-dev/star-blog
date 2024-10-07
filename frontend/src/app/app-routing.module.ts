import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../app/auth/auth.guard';
import { BlogCreateComponent } from '../app/components/blog-create/blog-create.component'; // Importando BlogCreateComponent
import { BlogEditComponent } from '../app/components/blog-edit/blog-edit.component'; // Importando BlogEditComponent
import { BlogListComponent } from '../app/components/blog-list/blog-list.component'; // Importando BlogListComponent
import { LoginComponent } from '../app/components/login/login.component';
import { RegisterComponent } from '../app/components/register/register.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component'; // Importando BlogDetailComponent
import { UserProfileComponent } from './components/user-profile/user-profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'blog', component: BlogListComponent }, // Rota para listar posts
  { path: 'blog/create', component: BlogCreateComponent, canActivate: [AuthGuard] }, // Rota para criar post
  { path: 'blog/edit/:id', component: BlogEditComponent, canActivate: [AuthGuard] }, // Rota para editar post
  { path: 'blog/post/:id', component: BlogDetailComponent }, // Rota para detalhes do post
  { path: 'user', component: UserProfileComponent, canActivate: [AuthGuard] } // Rota para perfil do usuário
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
