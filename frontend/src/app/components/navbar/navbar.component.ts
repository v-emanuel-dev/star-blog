import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/websocket.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

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
  notifications: any[] = [];
  unreadNotificationsCount: number = 0;
  isNotificationsOpen: boolean = false;
  userId: number | null = null; // Inicialize com null ou um valor padrão

  private userNameSubscription: Subscription;
  private profileImageSubscription: Subscription | undefined;
  private notificationsSubscription: Subscription | undefined; // Adicionando subscription para notificações

  constructor(
    private authService: AuthService,
    private router: Router,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {
    this.userNameSubscription = this.authService.userName$.subscribe((name) => {
      this.userName = name || null;
      this.loadProfilePicture();
    });

    this.profileImageSubscription = this.authService.profileImageUrl$.subscribe(
      (url) => {
        this.profileImageUrl = url || this.defaultProfilePicture; // Definindo uma imagem padrão
      }
    );
  }

  ngOnInit(): void {
    const userIdFromStorage = localStorage.getItem('userId');
    this.userId = userIdFromStorage ? Number(userIdFromStorage) : null;

    // Fetch notifications apenas se o userId estiver disponível
    if (this.userId) {
      this.fetchNotifications();
    }
    // Inscrever-se para receber notificações do WebSocket
    this.notificationsSubscription =
      this.webSocketService.notifications$.subscribe((notifications) => {
        console.log('Notificações recebidas no Navbar:', notifications);
        this.notifications = notifications;
        this.unreadNotificationsCount = this.notifications.length;
        console.log(
          'Número de notificações não lidas:',
          this.unreadNotificationsCount
        );
      });

    this.loadUserInfo();
    this.userName = this.authService.getUserName();
    this.loadProfilePicture();
    document.addEventListener('click', this.closeDropdowns.bind(this));
  }

  fetchNotifications() {
    if (!this.userId) return; // Verifica se userId está disponível

    this.http
      .get(`http://localhost:3000/api/users/${this.userId}/notifications`)
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

  private loadUserInfo(): void {
    this.userName = this.authService.getUserName();
    this.profileImageUrl =
      this.authService.getProfileImageUrl() || this.defaultProfilePicture;
  }

  private loadProfilePicture(): void {
    const storedProfilePicture = localStorage.getItem('profilePicture');
    // Se não houver imagem armazenada, usa a imagem padrão
    this.profileImageUrl = storedProfilePicture
      ? this.sanitizeUrl(storedProfilePicture)
      : this.defaultProfilePicture;
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

  ngOnDestroy() {
    this.userNameSubscription.unsubscribe();
    this.profileImageSubscription?.unsubscribe();
    document.removeEventListener('click', this.closeDropdowns.bind(this));
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    console.log(
      'toggleNotifications: Notificações abertas:',
      this.isNotificationsOpen
    ); // Verificar se o estado está sendo alterado
  }

  markAsRead(index: number) {
    this.notifications.splice(index, 1);
    this.unreadNotificationsCount = this.notifications.length;
    this.isNotificationsOpen = false; // Fecha as notificações ao marcar como lida
    this.notifications[index].read = true;
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

  logout(): void {
    this.authService.logout();
  }
}
