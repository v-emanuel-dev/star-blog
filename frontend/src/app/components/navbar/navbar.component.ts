import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  userName: string | undefined;
  isMenuOpen = false;
  isDropdownOpen = false;
  profilePicture: string | null = null;
  defaultProfilePicture: string = 'assets/img/default-profile.png'; // Caminho da imagem padrão
  private userNameSubscription: Subscription;
  profileImageUrl: string | null = null;
  private profileImageSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private router: Router, private userService: UserService
  ) {
    this.userNameSubscription = this.authService.userName$.subscribe(name => {
      this.userName = name; // Atualiza o nome do usuário quando ele muda
    });
  }

  ngOnInit(): void {
    this.loadProfilePicture();
    this.profileImageUrl = this.authService.getProfileImageUrl();

    this.profileImageSubscription = this.authService.profileImageUrl$.subscribe(
      (url) => {
        this.profileImageUrl = url;
      }
    );

    document.addEventListener('click', this.closeDropdown.bind(this));
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  login(email: string, password: string) {
    this.authService.login(email, password).subscribe(() => {
      this.router.navigate(['/blog']);
    });
  }

  loadProfilePicture(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (user) => {
          this.profilePicture = user.profilePicture || this.defaultProfilePicture;
        },
        (error) => {
          console.error('Erro ao carregar a imagem do perfil', error);
        }
      );
    }
  }

  goToLoginWithMessage() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/blog']);
    } else {
      this.router.navigate(['/login'], { queryParams: { message: 'Please log in to proceed' } });
    }
  }

  get formattedUserName(): string {
    if (this.userName) {
      return this.userName.charAt(0).toUpperCase() + this.userName.slice(1).toLowerCase();
    }
    return 'Usuário';
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userMenuButton = document.getElementById('user-menu-button');

    // Verifica se o clique foi fora do botão e do dropdown
    if (userMenuButton && !userMenuButton.contains(target) && this.isDropdownOpen) {
      this.isDropdownOpen = false; // Fecha o dropdown
    }
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.profileImageSubscription?.unsubscribe();
    this.userNameSubscription.unsubscribe();
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }
}
