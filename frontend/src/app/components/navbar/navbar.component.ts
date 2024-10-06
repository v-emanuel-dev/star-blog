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
  userName: string | undefined;
  isMenuOpen = false; // State to manage mobile menu visibility
  private userNameSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.userNameSubscription = this.authService.userName$.subscribe(name => {
      this.userName = name; // Atualiza o nome do usuário quando ele muda
      console.log('Updated Username in Navbar:', this.userName); // Log do nome atualizado no Navbar
    });
  }

  ngOnInit(): void {
    this.userNameSubscription = this.authService.userName$.subscribe(name => {
      this.userName = name;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  login(email: string, password: string) {
    this.authService.login(email, password).subscribe(() => {
      this.router.navigate(['/blog']);
    });
  }

  logout() {
    this.authService.logout();
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

  ngOnDestroy() {
    this.userNameSubscription.unsubscribe(); // Limpa a assinatura quando o componente é destruído
  }
}
