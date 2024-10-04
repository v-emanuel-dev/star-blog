import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login', // Selector for the component
  templateUrl: './login.component.html', // Path to the HTML template
})
export class LoginComponent {
  email: string = ''; // Email input field
  password: string = ''; // Password input field
  returnUrl: string | null = null; // URL to return after login, if needed
  message: string = ''; // Message to be displayed to the user
  success: boolean = false; // Indicates if the message is a success or error

  constructor(
    private authService: AuthService, // Injecting AuthService for authentication
    private route: ActivatedRoute, // Injecting ActivatedRoute to access route parameters
    private router: Router // Injecting Router for navigation
  ) {}

  ngOnInit() {
    // This lifecycle hook runs after the component is initialized
    this.route.queryParams.subscribe(params => {
      // Subscribing to query parameters to check for messages
      if (params['message']) { // Use brackets to access the parameter
        this.message = params['message']; // Set the message from query params
        this.success = false; // Set success to false for error messages
      }
    });
  }

  login() {
    // Method to handle login
    this.authService.login(this.email, this.password).subscribe(response => {
      // On successful login
      localStorage.setItem('token', response.accessToken); // Store the token in local storage
      this.message = 'Login successful! Redirecting...'; // Success message
      this.success = true; // Indicate success
      setTimeout(() => {
        this.router.navigate(['/blog']); // Redirect to the dashboard after 2 seconds
      }, 1500); // Wait for 2 seconds before redirecting
    }, error => {
      // On login failure
      console.error('Login failed:', error); // Log the error for debugging
      this.message = 'Login failed! Check your credentials.'; // Error message
      this.success = false; // Indicate failure
    });
  }

  logout() {
    // Method to handle logout
    this.authService.logout(); // Call the logout method from AuthService
  }
}
