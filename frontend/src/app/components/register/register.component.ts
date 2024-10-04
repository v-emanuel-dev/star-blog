// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';
  success: boolean = false;
  loading: boolean = false; // Loading state

  constructor(private authService: AuthService, private router: Router) {}

  // Method to handle registration
  register(form: NgForm) {
    if (form.invalid) {
      this.message = 'Please fill in all fields correctly.';
      this.success = false;
      return;
    }

    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.'; // Error message for password mismatch
      this.success = false;
      return;
    }

    this.loading = true; // Set loading state to true
    this.authService.register(this.email, this.username, this.password).subscribe(
      response => {
        this.message = 'Registration successful! Please log in.';
        this.success = true;
        form.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error => {
        this.message = error.error.message || 'Registration failed. Please try again.'; // Enhanced error message
        this.success = false;
      },
      () => {
        this.loading = false; // Reset loading state on complete
      }
    );
  }
}
