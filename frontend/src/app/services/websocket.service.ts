// src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Definindo uma interface para Notificações
interface Notification {
  id?: number; // Opcional, caso a notificação já tenha um ID do banco de dados
  userId: string;
  message: string;
  postId: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private userId: string | null = localStorage.getItem('userId'); // Obtém o ID do usuário do localStorage

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000'); // Considere usar HTTPS em produção

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO', this.socket.id);
    });

    this.socket.on('new-comment', (data: Notification) => {
      console.log('Nova notificação recebida:', data); // Log dos dados da notificação
      this.addNotification(data);
    });

    // Recuperar notificações do banco de dados ao iniciar o serviço
    if (this.userId) {
      this.fetchNotifications(this.userId);
    }
  }

  private fetchNotifications(userId: string) {
    this.http
      .get<Notification[]>(`http://localhost:3000/api/comments/${userId}/notifications`)
      .subscribe(
        (notifications) => {
          this.notificationsSubject.next(notifications);
        },
        (error) => {
          console.error('Erro ao recuperar notificações do banco de dados:', error);
        }
      );
  }

  private addNotification(notification: Notification) {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [...currentNotifications, notification];

    // Atualizar o BehaviorSubject
    this.notificationsSubject.next(updatedNotifications);

    // Salvar notificação no banco de dados
    this.saveNotificationToDatabase(notification);

    console.log('Notificação adicionada:', notification); // Log para confirmar que a notificação foi adicionada
  }

  private saveNotificationToDatabase(notification: Notification) {
    if (this.userId) {
      this.http
        .post<Notification>(
          `http://localhost:3000/api/comments/${this.userId}/notifications`,
          { message: notification.message, postId: notification.postId }
        )
        .subscribe(
          (response) => {
            console.log('Notificação salva no banco de dados:', response);
          },
          (error) => {
            console.error('Erro ao salvar notificação no banco de dados:', error);
          }
        );
    }
  }

  // Método para desconectar o socket (opcional)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Desconectado do servidor Socket.IO');
    }
  }
}
