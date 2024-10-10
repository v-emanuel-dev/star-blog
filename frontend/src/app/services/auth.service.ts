import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http
      .post<any>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          console.log('Login Response:', response); // Log da resposta do login
          localStorage.setItem('accessToken', response.accessToken);
          console.log('Extracted Username:', response.username); // Log do username extraído
          localStorage.setItem('userName', response.username);
          localStorage.setItem('email', response.email); // Armazenando o email
          localStorage.setItem('userId', response.userId); // Armazenando o userId

          // Atualiza o subject com o nome do usuário e ID do usuário
          this.userNameSubject.next(response.username);
          this.currentUserIdSubject.next(response.userId); // Atualizando o ID do usuário logado
          console.log('Username stored in localStorage:', response.username); // Log do nome do usuário armazenado
        })
      );
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, {
      email,
      username,
      password,
    });
  }

  getUserName(): string {
    return localStorage.getItem('userName') || 'Usuário';
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

  // Outros métodos (login, logout, updateUser, etc.)

  updateUser(
    userId: string,
    username: string,
    email: string,
    password: string | null,
    selectedImage: File | null,
    headers: HttpHeaders
  ): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);

    if (password) {
      formData.append('password', password);
    }

    if (selectedImage) {
      formData.append('profilePicture', selectedImage);
    }

    return this.http.put(`${this.baseUrl}/update`, formData, { headers });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('accessToken') !== null; // Corrigido para verificar 'accessToken'
  }

  logout() {
    // Removendo os dados do localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');

    // Emitindo undefined para limpar a exibição do nome de usuário
    this.userNameSubject.next(undefined);
    this.currentUserIdSubject.next(null); // Limpando o ID do usuário

    // Redirecionando para a página de login após o logout
    this.router.navigate(['/login']);
  }
}
