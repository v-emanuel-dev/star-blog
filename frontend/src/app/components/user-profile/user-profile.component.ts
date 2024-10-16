import { UserService } from './../../services/user.service';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageService } from '../../services/image.service';

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
  profilePicture: string | null = null;
  defaultPicture: string = 'URL_DA_IMAGEM_PADRAO'; // Substitua pela URL da imagem padrão

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private imageService: ImageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    console.log('UserProfile initialized.');
    this.imageService.profilePic$.subscribe((pic) => {
      console.log('Profile picture updated in MenuComponent:', pic);
      this.profilePicture = pic || this.defaultPicture;
      // Força o Angular a detectar mudanças na imagem
      this.cd.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    // Força a detecção de mudanças após a inicialização da view
    console.log('ngAfterViewInit called, forcing change detection.');
    this.cd.detectChanges();
  }

  onImageError() {
    console.log('Failed to load profile picture, using default.');
    this.profilePicture = this.defaultPicture;
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

          // Usa o método do ImageService para obter a URL da imagem de perfil
          const profilePictureUrl = this.imageService.getFullProfilePicUrl(user.profilePicture || '');

          // Atualiza a imagem de perfil no ImageService
          this.imageService.updateProfilePic(profilePictureUrl);

          console.log('Profile Picture updated in ImageService:', profilePictureUrl);
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
        this.selectedImagePreview =
          reader.result as string;
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
