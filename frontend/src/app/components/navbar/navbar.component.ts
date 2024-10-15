import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/websocket.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  isMenuOpen = false;
  isDropdownOpen = false;
  profileImageUrl: SafeUrl | string | null = null;
  defaultProfilePicture: string = 'assets/img/default-profile.png';
  notifications: any[] = [];
  unreadNotificationsCount: number = 0;
  isNotificationsOpen: boolean = false;
  userId: number | null = null; // Inicialize com null ou um valor padrão

  private notificationsSubscription: Subscription | undefined; // Adicionando subscription para notificações
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private webSocketService: WebSocketService,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Inscreva-se para mudanças na imagem de perfil
    this.subscription.add(
      this.userService.profilePicture$.subscribe(url => {
        this.profileImageUrl = this.getSanitizedImageUrl(url);
        console.log('Profile image URL updated in Navbar:', this.profileImageUrl);
      })
    );

    this.notificationsSubscription =
      this.webSocketService.notifications$.subscribe((notifications) => {
        console.log('Notificações recebidas no Navbar:', notifications);
        this.notifications = notifications;
        this.unreadNotificationsCount = this.notifications.length;
        this.changeDetectorRef.detectChanges(); // Força a detecção de mudanças na interface

        console.log(
          'Número de notificações não lidas:',
          this.unreadNotificationsCount
        );
      });

    this.loadUserInfo();
    document.addEventListener('click', this.closeDropdowns.bind(this));
  }

  getSanitizedImageUrl(url: string | null): SafeUrl {
    return url ? this.sanitizer.bypassSecurityTrustUrl(url) : this.defaultProfilePicture;
  }

  private loadUserInfo(): void {
    const storedProfilePicture = localStorage.getItem('profilePicture');
    this.profileImageUrl = this.getSanitizedImageUrl(storedProfilePicture);
    console.log('Loaded profile image URL in Navbar:', this.profileImageUrl);
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
      },
    });
  }

  goToLoginWithMessage() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/blog']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { message: 'Please log in to proceed' },
      });
    }
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    console.log(
      'toggleNotifications: Notificações abertas:',
      this.isNotificationsOpen
    ); // Verificar se o estado está sendo alterado
  }

  markAsRead(index: number) {
    if (index < 0 || index >= this.notifications.length) {
      console.error(
        'Índice inválido para marcação de notificação como lida:',
        index
      );
      return;
    }

    const notificationToRemove = this.notifications[index];
    console.log('Marcando a notificação como lida:', notificationToRemove); // Log da notificação sendo marcada como lida

    // Atualiza o estado local
    this.notifications.splice(index, 1);
    this.unreadNotificationsCount = this.notifications.length;
    this.isNotificationsOpen = false; // Fecha as notificações ao marcar como lida

    // Atualiza a notificação como lida
    notificationToRemove.read = true;

    // Remover a notificação do banco de dados
    this.removeNotificationFromDatabase(notificationToRemove.id).subscribe(
      () => {
        console.log(
          'Notificação removida do banco de dados com sucesso:',
          notificationToRemove.id
        );
      },
      (error) => {
        console.error('Erro ao remover notificação do banco de dados:', error);
      }
    );
  }

  private removeNotificationFromDatabase(notificationId: number) {
    return this.http.delete(
      `http://localhost:3000/api/comments/notifications/${notificationId}`
    );
  }

  closeDropdowns(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const notificationButton = document.querySelector('.fa-bell');
    const userMenuButton = document.getElementById('user-menu-button');

    if (
      notificationButton &&
      !notificationButton.contains(target) &&
      userMenuButton &&
      !userMenuButton.contains(target) &&
      !target.closest('.notifications') // Verifica se o clique ocorreu fora das notificações
    ) {
      this.isNotificationsOpen = false;
      this.isDropdownOpen = false;
    }
  }

  fetchNotifications() {
    if (!this.userId) return; // Verifica se userId está disponível

    this.http
      .get(`http://localhost:3000/api/comments/${this.userId}/notifications`)
      .subscribe(
        (data: any) => {
          this.notifications = data;
          this.unreadNotificationsCount = this.notifications.filter(
            (n) => !n.read
          ).length; // Atualiza a contagem de notificações não lidas
        },
        (error: HttpErrorResponse) => {
          console.error('Erro ao buscar notificações:', error);
        }
      );
  }

  hasNotifications(): boolean {
    return this.unreadNotificationsCount > 0;
  }

  markNotificationAsRead(index: number): void {
    this.notifications.splice(index, 1);
    this.unreadNotificationsCount = this.notifications.length;
    // Aqui, você pode enviar uma atualização para o backend, se necessário, para marcar a notificação como lida.
  }

  logout(): void {
    this.notifications = [];
    this.unreadNotificationsCount = 0;

    this.authService.logout();
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdowns.bind(this));
  }
}
