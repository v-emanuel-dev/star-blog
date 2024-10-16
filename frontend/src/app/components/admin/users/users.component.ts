import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'] // Corrigi 'styleUrl' para 'styleUrls'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  editingUser: any = null;

  constructor(private userService: UserService) {
    console.log('UsersComponent instantiated');
  }

  ngOnInit() {
    console.log('ngOnInit called');
    this.loadUsers();
  }


  loadUsers() {
    this.userService.getUsers().subscribe(
      users => {
        console.log('Loaded users:', users); // Log para verificar os usuários carregados
        this.users = users;
      },
      error => {
        console.error('Error loading users:', error); // Log para erros
      }
    );
  }

  startEdit(user: any) {
    console.log('Editing user:', user); // Log do usuário que está sendo editado
    this.editingUser = { ...user };
  }

  saveEdit() {
    if (this.editingUser) {
      console.log('Saving user:', this.editingUser); // Log do usuário que está sendo salvo
      this.userService.updateUserAdmin(this.editingUser.id, this.editingUser)
        .subscribe(() => {
          console.log('User updated successfully:', this.editingUser); // Log de sucesso na atualização
          this.loadUsers();
          this.editingUser = null;
        }, error => {
          console.error('Error updating user:', error); // Log de erro na atualização
        });
    }
  }

  cancelEdit() {
    console.log('Edit canceled for user:', this.editingUser); // Log do cancelamento da edição
    this.editingUser = null;
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        console.log('User deleted successfully:', response);
        // Atualiza a lista de usuários após a deleção
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      },
    });
  }
}
