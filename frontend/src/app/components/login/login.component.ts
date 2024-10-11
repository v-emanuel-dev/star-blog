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
  success: boolean = false; // Indicates if the message is a success or error
  message: string | null = null; // Mensagem a ser exibida
  loading = false; // Adicione esta variável na sua classe

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
    // Inicie o loading
    this.loading = true;

    // Método para lidar com login
    this.authService.login(this.email, this.password).subscribe(response => {
      // No login bem-sucedido
      localStorage.setItem('token', response.accessToken); // Armazena o token no local storage
      this.message = 'Login successful! Redirecting...'; // Mensagem de sucesso
      this.success = true; // Indica sucesso

      setTimeout(() => {
        this.router.navigate(['/blog']); // Redireciona para o dashboard após 2 segundos
        this.loading = false; // Pare o loading após o redirecionamento
      }, 1500); // Aguarda 2 segundos antes de redirecionar

    }, error => {
      // Em caso de falha no login
      console.error('Login failed:', error); // Registra o erro para depuração
      this.message = 'Login failed! Check your credentials.'; // Mensagem de erro
      this.success = false; // Indica falha
      this.loading = false; // Pare o loading em caso de erro
    });
  }

  logout() {
    // Method to handle logout
    this.authService.logout(); // Call the logout method from AuthService
  }
}
