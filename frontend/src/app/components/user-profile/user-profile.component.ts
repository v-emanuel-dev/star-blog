// src/app/components/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  username: string = '';
  email: string | null = null;
  password: string = '';
  confirmPassword: string = '';
  message: string | undefined;
  success: boolean | undefined;
  loading: boolean = false; // Loading state

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.username = localStorage.getItem('userName') || '';
    this.email = localStorage.getItem('email') || '';
  }

  updateUser(form: NgForm) {
    if (form.invalid) {
      this.message = 'Please fill in all fields correctly.';
      this.success = false;
      return;
    }

    if (this.password && this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.success = false;
      return;
    }

    const userId = localStorage.getItem('userId') ?? '';
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.loading = true; // Start loading state

    this.authService.updateUser(userId, this.username, this.email ?? '', this.password || '', headers).subscribe(
      response => {
        this.message = 'User updated successfully';
        this.success = true;
        localStorage.setItem('email', this.email ?? '');
        localStorage.setItem('userName', this.username);

        // Clear password fields after successful update
        this.password = '';
        this.confirmPassword = '';

        setTimeout(() => {
          this.router.navigate(['/blog']);
        }, 1500);
      },
      error => {
        console.error('Error updating user', error);
        this.message = error.error.message || 'Error updating user'; // Use server message if available
        this.success = false;
      },
      () => {
        this.loading = false; // End loading state
      }
    );
  }
}
