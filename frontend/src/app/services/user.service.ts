import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  public profilePictureSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public profilePicture$ = this.profilePictureSubject.asObservable();

  constructor(private http: HttpClient) {}

  updateProfilePicture(picture: string | null) {
    this.profilePictureSubject.next(picture);
  }

  // user.service.ts
  // user.service.ts
getUserById(userId: number) {
  return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
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
