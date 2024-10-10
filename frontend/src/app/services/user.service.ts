import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // user.service.ts
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

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

    return this.http.put(`${this.apiUrl}/update/${userId}`, formData, {
      headers,
    });
  }
}
