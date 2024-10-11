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
  defaultProfilePicture: string = 'assets/img/default-profile.png'; // Caminho da imagem padrão

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const userId = this.authService.getUserId();

    if (userId !== null) {
      this.userService.getUserById(userId).subscribe(
        (user) => {
          this.username = user.username || '';
          this.email = user.email || '';
          this.profilePicture =
            user.profilePicture || this.defaultProfilePicture;
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

    const userId = localStorage.getItem('userId');
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
          this.loadUserData();
          this.selectedImage = null;
        },
        (error) => {
          console.error('Error updating user', error);
          this.message = error.error.message || 'Error updating user';
          this.success = false;
        }
      );
  }
}
