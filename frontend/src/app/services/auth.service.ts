import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';
  private userNameSubject = new BehaviorSubject<string | undefined>(this.getUserName());
  userName$: Observable<string | undefined> = this.userNameSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('Login Response:', response); // Log da resposta do login
        localStorage.setItem('accessToken', response.accessToken);
        console.log('Extracted Username:', response.username); // Log do username extraído
        localStorage.setItem('userName', response.username);
        localStorage.setItem('email', response.email); // Armazenando o email
        localStorage.setItem('userId', response.userId); // Armazenando o userId

        // Atualiza o subject com o nome do usuário
        this.userNameSubject.next(response.username);
        console.log('Username stored in localStorage:', response.username); // Log do nome do usuário armazenado
      })
    );
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, { email, username, password });
  }

  getUserName(): string {
    return localStorage.getItem('userName') || 'Usuário';
  }

  // Método para obter o token do localStorage
  getToken(): string | null {
    return localStorage.getItem('token'); // Certifique-se de que o token está armazenado com a chave 'token'
  }

  // Outros métodos (login, logout, updateUser, etc.)

  updateUser(userId: string, username: string, email: string, password: string | null, headers: HttpHeaders): Observable<any> {
    // Cria o objeto body com os campos obrigatórios
    const body: any = { username, email };

    // Se a senha for preenchida, adicione ao corpo da requisição
    if (password) {
      body.password = password;
    }

    // Envia a requisição de atualização do usuário
    return this.http.put(`${this.baseUrl}/update`, body, { headers });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('accessToken') !== null; // Corrigido para verificar 'accessToken'
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    this.userNameSubject.next(undefined); // Emitindo undefined quando fizer logout
  }
}
