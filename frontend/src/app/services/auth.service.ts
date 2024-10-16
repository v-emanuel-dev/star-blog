import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ImageService } from './image.service';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';

  private userNameSubject = new BehaviorSubject<string | undefined>(
    this.getUserName()
  );

  private currentUserIdSubject = new BehaviorSubject<number | null>(
    this.getLoggedUserId()
  ); // Adicionando a BehaviorSubject para o ID do usuário

  userName$: Observable<string | undefined> =
    this.userNameSubject.asObservable();
  userId$: Observable<number | null> = this.currentUserIdSubject.asObservable(); // Para expor o ID do usuário como um Observable

  private userLoggedInSubject = new BehaviorSubject<boolean>(false);
  userLoggedIn$ = this.userLoggedInSubject.asObservable();

  private profileImageUrlSubject = new BehaviorSubject<string | null>(null);
  profileImageUrl$ = this.profileImageUrlSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private imageService: ImageService,
    private websocketService: WebSocketService
  ) {}

  login(email: string, password: string) {
    return this.http
      .post<any>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          // Armazena informações no localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('userName', response.username);
          localStorage.setItem('email', response.email); // Armazenando o email
          localStorage.setItem('userId', response.userId); // Armazenando o userId

          // Verificando se a imagem de perfil é local ou do Google e armazenando corretamente.
          let profilePicUrl = response.profilePicture; // Use 'response.profilePicture' corretamente.

          // Troca as barras invertidas por barras normais
          profilePicUrl = profilePicUrl.replace(/\\/g, '/');

          // Adiciona o prefixo para usuários locais (caso o path não contenha 'http')
          if (profilePicUrl && !profilePicUrl.startsWith('http')) {
            profilePicUrl = `http://localhost:3000/${profilePicUrl}`;
          }

          // Armazena a imagem de perfil no localStorage com a URL completa.
          localStorage.setItem('profilePicture', profilePicUrl);
          console.log('Stored Profile Picture:', profilePicUrl);

          // Atualiza o BehaviorSubject para notificar os componentes que a imagem foi atualizada.
          this.profileImageUrlSubject.next(profilePicUrl);
          this.imageService.updateProfilePic(profilePicUrl); // Notifica o UserService

          // Atualiza o subject com o nome do usuário e ID do usuário
          this.userNameSubject.next(response.username);
          this.currentUserIdSubject.next(response.userId); // Atualizando o ID do usuário logado

          // Notifica que o usuário está logado
          this.userLoggedInSubject.next(true);

          // Inicializa WebSocket para buscar notificações
          this.websocketService.fetchNotifications(response.userId); // Adiciona esta linha
          console.log('Fetching notifications for User ID:', response.userId);
        })
      );
  }


  updateProfileImageUrl(url: string): void {
    localStorage.setItem('profilePicture', url);
    this.profileImageUrlSubject.next(url);
    console.log('Profile picture updated in localStorage:', url); // Adicione este log
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, {
      email,
      username,
      password,
    });
  }

  getUserName(): string {
    return localStorage.getItem('username') || 'Visitor';
  }

  getUserId(): number | null {
    return this.currentUserIdSubject.value; // Retorna o ID do usuário logado ou null se não estiver logado
  }

  // Método para obter o token do localStorage
  getToken(): string | null {
    return localStorage.getItem('token'); // Certifique-se de que o token está armazenado com a chave 'token'
  }

  getLoggedUserId(): number | null {
    const storedUserId = localStorage.getItem('userId'); // ou o que você usar para armazenar o ID do usuário
    return storedUserId ? parseInt(storedUserId, 10) : null; // Retorna o ID do usuário
  }

  getCurrentUserId(): number | null {
    return this.currentUserIdSubject.value; // Retorna o ID do usuário logado ou null se não estiver logado
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null; // Corrigido para verificar 'accessToken'
  }

  setProfileImageUrl(url: string): void {
    this.profileImageUrlSubject.next(url);
  }

  getProfileImageUrl(): string | null {
    return this.profileImageUrlSubject.value;
  }

  logout() {
    // Limpa todo o localStorage
    localStorage.clear();

    this.userLoggedInSubject.next(false);
    this.userNameSubject.next(undefined);
    this.currentUserIdSubject.next(null); // Limpando o ID do usuário

    this.profileImageUrlSubject.next(null);
    this.imageService.clearProfilePic(); // Notificar o UserService sobre a remoção da imagem

    // Redirecionando para a página de login após o logout
    this.router.navigate(['/login']);
  }
}
