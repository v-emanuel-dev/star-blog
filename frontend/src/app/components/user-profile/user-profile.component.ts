import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  username: string = '';
  email: string | null = null;
  password: string = '';
  confirmPassword: string = '';
  message: string | null = null;
  success: boolean | undefined;
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
  profilePicture: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const userId = this.authService.getUserId(); // Obtém o ID do usuário
    console.log('User ID:', userId); // Log do userId

    if (userId !== null) {
      this.userService.getUserById(userId).subscribe(
        (user) => {
          this.username = user.username || '';
          this.email = user.email || '';
          this.profilePicture = `http://localhost:3000/${user.profilePicture}`; // Define o caminho completo da imagem de perfil
          console.log('User data loaded:', user); // Log dos dados do usuário
          console.log('Profile Picture URL:', this.profilePicture); // Log do URL da imagem de perfil
        },
        (error) => {
          console.error('Erro ao carregar os dados do usuário', error);
        }
      );
    } else {
      console.error('User ID não encontrado ou usuário não está logado');
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImage = file;

      // Previsualização da imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateUser(form: NgForm) {
    if (form.invalid) {
        this.message = 'Please fill in all fields correctly.';
        this.success = false;
        return;
    }

    if (this.password && this.password !== this.confirmPassword) {
        this.message = 'Passwords do not match.';
        this.success = false;
        return;
    }

    const userId = localStorage.getItem('userId'); // Isso retornará uma string ou null
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    if (userId === null) {
        this.message = 'User ID not found.';
        this.success = false;
        return;
    }

    this.userService
        .updateUser(
            String(userId),
            this.username,
            this.email ?? '',
            this.password || '',
            this.selectedImage,
            headers
        )
        .subscribe(
            (response) => {
                this.message = 'User updated successfully';
                this.success = true;
                localStorage.setItem('email', this.email ?? '');
                localStorage.setItem('userName', this.username);

                // Limpa os campos de senha
                this.password = '';
                this.confirmPassword = '';

                // Carrega novamente os dados do usuário
                this.loadUserData(); // Recarrega os dados do usuário
            },
            (error) => {
                console.error('Error updating user', error);
                this.message = error.error.message || 'Error updating user';
                this.success = false;
            }
        );
}

}
