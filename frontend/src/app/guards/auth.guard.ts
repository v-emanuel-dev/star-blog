import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token && !this.isTokenExpired(token)) {
      return true; // Allow access if token is present and not expired
    }

    // Log the denied access attempt
    console.warn('Access denied - no valid token found.');

    // If no token or expired, navigate to the login page
    this.router.navigate(['/login']);
    return false; // Deny access
  }

  private isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry to milliseconds
    return Date.now() > expiry; // Check if the current time is greater than expiry time
  }
}
