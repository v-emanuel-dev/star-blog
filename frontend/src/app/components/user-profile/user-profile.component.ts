import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  selectedImagePreview: SafeUrl | null = null;
  profilePicture: SafeUrl | null = null;
  defaultProfilePicture: string = 'assets/img/default-profile.png'; // Caminho da imagem padrão
  profileImageUrl: SafeUrl | null = null; // Adiciona a propriedade profileImageUrl

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.profilePicture = localStorage.getItem('profilePicture');
    const storedImageUrl = localStorage.getItem('profilePicture'); // Substitua pelo nome correto da chave

    if (storedImageUrl) {
      this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(storedImageUrl);
      console.log('Loaded profile image URL:', this.profileImageUrl);
    } else {
      this.profileImageUrl = null;
    }

    // Carrega a imagem de perfil inicialmente do localStorage
    this.loadProfilePicture();
    this.loadUserData();
  }

  loadProfilePicture(): void {
    const storedProfilePicture = this.getProfilePicture();

    // Verifica se a imagem de perfil armazenada existe
    this.profileImageUrl = storedProfilePicture
      ? this.getProfilePictureUrl(storedProfilePicture)
      : this.sanitizeUrl(this.defaultProfilePicture);

    console.log('Loaded profile picture:', this.profileImageUrl);
  }

  getProfilePicture(): string | null {
    const profilePicture = localStorage.getItem('profilePicture');
    console.log('Getting profile picture from localStorage:', profilePicture);

    if (profilePicture) {
      // Remove qualquer prefixo indesejado de 'http://localhost:3000/'
      const sanitizedProfilePicture = profilePicture.replace(
        'http://localhost:3000/',
        ''
      ).replace(/\\/g, '/'); // Troca barras invertidas por barras normais

      return sanitizedProfilePicture; // Retorna apenas o caminho do arquivo
    }

    return null;
  }

  sanitizeUrl(url: string): SafeUrl {
    // Substitui barras invertidas por barras normais
    const normalizedUrl = url.replace(/\\/g, '/');
    return this.sanitizer.bypassSecurityTrustUrl(normalizedUrl);
  }

  getProfilePictureUrl(profilePicture: string): SafeUrl {
    if (profilePicture) {
      // Verifica se a imagem é uma URL completa
      if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
        return this.sanitizeUrl(profilePicture); // Retorna a URL externa como está
      } else {
        // Retorna o caminho local com a formatação correta
        return this.sanitizeUrl(`http://localhost:3000/uploads/${profilePicture}`);
      }
    }
    return this.sanitizeUrl(this.defaultProfilePicture); // Retorna a imagem padrão se não houver
  }

  loadUserData(): void {
    const userId = this.authService.getUserId();
    console.log('Loading user data for userId:', userId);

    if (userId !== null) {
      this.userService.getUserById(userId).subscribe(
        (user) => {
          this.username = user.username || '';
          this.email = user.email || '';
          console.log('User data loaded:', user);

          // Usa o método para obter a URL da imagem de perfil
          this.profilePicture = this.getProfilePictureUrl(user.profilePicture || '');
          localStorage.setItem('profilePicture', this.profilePicture.toString()); // Armazena a imagem sanitizada

          console.log('Profile Picture updated and saved to localStorage:', this.profilePicture);
        },
        (error) => {
          console.error('Error loading user data', error);
        }
      );
    } else {
      console.error('User ID not found or user is not logged in');
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = this.sanitizer.bypassSecurityTrustUrl(
          reader.result as string
        );
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

          // Notifica a navbar sobre a atualização da imagem do perfil
          if (this.selectedImage) {
            const imageUrl = URL.createObjectURL(this.selectedImage);
            this.userService.updateProfilePicture(imageUrl);
          }

          this.selectedImage = null;
          setTimeout(() => {
            this.router.navigate(['/blog']); // Redireciona para o dashboard após 2 segundos
          }, 1500);
        },
        (error) => {
          console.error('Error updating user', error);
          this.message = error.error.message || 'Error updating user';
          this.success = false;
        }
      );
  }
}
