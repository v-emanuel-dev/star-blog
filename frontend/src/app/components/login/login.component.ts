import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ChangeDetectorRef } from '@angular/core';

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
  profileImageUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const storedImage = localStorage.getItem('profileImage');
    this.profileImageUrl = storedImage ? storedImage : null;
    // This lifecycle hook runs after the component is initialized
    this.route.queryParams.subscribe((params) => {
      // Subscribing to query parameters to check for messages
      if (params['message']) {
        // Use brackets to access the parameter
        this.message = params['message']; // Set the message from query params
        this.success = false; // Set success to false for error messages
      }
    });

    this.profileImageUrl = this.authService.getProfileImageUrl();
  }

  login() {
    this.loading = true;

    // Chama o serviço de login passando o email e a senha.
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        localStorage.setItem('token', response.accessToken);
        this.message = 'Login successful! Redirecting...';
        this.success = true;

        const userId = response.userId; // Certifique-se de que você tenha o ID do usuário na resposta.

        // Carregar a imagem do perfil após o login.
        this.userService.getUserById(userId).subscribe(
          (user) => {
            // Define a URL da imagem de perfil no AuthService para propagar a mudança.
            if (user.profilePicture) {
              this.authService.setProfileImageUrl(user.profilePicture);
            }
            this.loading = false;
            this.router.navigate(['/blog']); // Redireciona para a página do blog após o login.
          },
          (error) => {
            console.error('Error fetching user data:', error);
            this.loading = false;
          }
        );
      },
      (error) => {
        console.error('Login failed:', error);
        this.message = 'Login failed! Check your credentials.';
        this.success = false;
        this.loading = false;
      }
    );
  }


  logout() {
    this.authService.logout(); // Limpa informações no AuthService.
    localStorage.removeItem('token'); // Remove o token de autenticação do localStorage.
    this.authService.setProfileImageUrl(''); // Define a URL da imagem como vazia.
    this.profileImageUrl = null; // Limpa a variável que armazena a URL da imagem.
    this.router.navigate(['/login']); // Redireciona para a página de login.
  }
}
