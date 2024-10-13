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
    const profilePicture = this.userService.getProfilePicture();
    console.log('Revalidated profile image URL:', profilePicture);
    this.profileImageUrl = this.sanitizeUrl(
      profilePicture || 'path/to/default/image'
    );

    // Assinatura para ouvir mudanças na imagem do perfil
    this.userService.profilePictureSubject.subscribe((picture) => {
      if (picture) {
        this.profileImageUrl = this.sanitizeUrl(picture);
        localStorage.setItem('profilePicture', picture);
        console.log('Profile Picture saved to localStorage:', picture);
      } else {
        console.warn('Profile picture URL is not valid:', picture);
      }
    });

    this.loadProfilePicture(); // Carrega a imagem do perfil do localStorage
    this.loadUserData();

    // Assinatura para ouvir mudanças na imagem do perfil
    this.userService.profilePictureSubject.subscribe((picture) => {
      if (picture && picture.startsWith('http')) {
        localStorage.setItem('profilePicture', picture);
        console.log('Profile Picture saved to localStorage:', picture);
      } else {
        console.warn('Profile picture URL is not valid:', picture);
      }
    });
  }

  loadProfilePicture(): void {
    const storedProfilePicture = this.getProfilePicture();
    this.profilePicture = storedProfilePicture
      ? this.sanitizeUrl(storedProfilePicture)
      : this.sanitizeUrl(this.defaultProfilePicture);

    console.log('Loaded profile picture:', this.profilePicture);
  }

  getProfilePicture(): string | null {
    const profilePicture = localStorage.getItem('profilePicture');
    console.log('Getting profile picture from localStorage:', profilePicture);
    return profilePicture;
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
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

          // Verifica e carrega a imagem de perfil
          this.profilePicture = user.profilePicture
            ? this.sanitizeUrl(user.profilePicture)
            : this.sanitizeUrl(this.defaultProfilePicture);

          // Salva a imagem de perfil no localStorage
          localStorage.setItem('profilePicture', user.profilePicture || '');
          console.log('Profile Picture saved to localStorage:', user.profilePicture);
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
