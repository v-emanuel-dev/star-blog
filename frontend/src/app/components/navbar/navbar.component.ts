import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  isMenuOpen = false;
  isDropdownOpen = false;
  profileImageUrl: string | null = null;
  defaultProfilePicture: string = 'assets/img/default-profile.png';

  private userNameSubscription: Subscription;
  private profileImageSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private router: Router) {
    this.userNameSubscription = this.authService.userName$.subscribe((name) => {
      this.userName = name || null;
      this.loadProfilePicture();
    });

    this.profileImageSubscription = this.authService.profileImageUrl$.subscribe((url) => {
      this.profileImageUrl = url || this.defaultProfilePicture; // Definindo uma imagem padrão
    });
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.userName = this.authService.getUserName();
    this.loadProfilePicture(); // Sempre tentar carregar a imagem de perfil ao inicializar
    document.addEventListener('click', this.closeDropdown.bind(this));
  }

  private loadUserInfo(): void {
    this.userName = this.authService.getUserName();
    this.profileImageUrl = this.authService.getProfileImageUrl() || this.defaultProfilePicture;
  }

  private loadProfilePicture(): void {
    const storedProfilePicture = localStorage.getItem('profilePicture');
    // Se não houver imagem armazenada, usa a imagem padrão
    this.profileImageUrl = storedProfilePicture ? this.sanitizeUrl(storedProfilePicture) : this.defaultProfilePicture;
    console.log('Loaded profile image URL:', this.profileImageUrl);
  }

  sanitizeUrl(url: string): string {
    return url.replace('http://localhost:3000/', ''); // Remova o prefixo indesejado
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  login(email: string, password: string) {
    console.log('Attempting login with email:', email); // Log do email usado para login
    this.authService.login(email, password).subscribe({
      next: (response) => {
        // Isso deve incluir a resposta do backend
        console.log('Login successful, response:', response); // Log da resposta do login
        this.loadUserInfo(); // Carregar informações do usuário após o login
        this.router.navigate(['/blog']);
      },
      error: (error) => {
        console.error('Login failed:', error); // Log de erro no login
      }
    });
  }

  goToLoginWithMessage() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/blog']);
    } else {
      this.router.navigate(['/login'], { queryParams: { message: 'Please log in to proceed' } });
    }
  }

  ngOnDestroy() {
    this.userNameSubscription.unsubscribe();
    this.profileImageSubscription?.unsubscribe();
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userMenuButton = document.getElementById('user-menu-button');

    if (userMenuButton && !userMenuButton.contains(target) && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
