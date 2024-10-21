import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'], // Corrigi 'styleUrl' para 'styleUrls'
})
export class DashboardComponent implements OnInit {
  users$: Observable<any[]>; // Observable para a lista de usuários
  loading: boolean = true; // Indicador de carregamento
  message: string | null = null;
  editingUser: User | null = null;

  constructor(private userService: UserService) {
    this.users$ = this.userService.users$;
  }

  ngOnInit() {
    console.log('ngOnInit called');

    this.loadUsers(); // Carrega usuários inicialment
  }

  loadUsers(): void {
    console.log('Loading users...');
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded successfully:', users);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.message = 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  deleteUser(userId: number): void {
    console.log('Attempting to delete user with ID:', userId);
    this.loading = true;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log('User deleted successfully:', userId);
        this.message = 'User deleted successfully!';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.message = 'Failed to delete user.';
        this.loading = false;
      },
    });
  }

  startEditUser(user: User) {
    console.log('Editing user:', user);
    this.editingUser = { ...user };
  }

  saveEditUser() {
    if (this.editingUser) {
      console.log('Saving user:', this.editingUser);
      this.userService.updateUserAdmin(this.editingUser.id, this.editingUser).subscribe({
        next: () => {
          console.log('User updated successfully:', this.editingUser);
          this.editingUser = null; // Limpa a edição
        },
        error: (err) => {
          console.error('Error updating user:', err);
        },
      });
    }
  }

  cancelEdit() {
    console.log('Edit canceled');
    this.editingUser = null; // Limpa a edição
  }
}
