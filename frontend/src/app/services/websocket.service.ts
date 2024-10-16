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
  private userId: string | null = localStorage.getItem('userId');

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO', this.socket.id);
    });

    this.socket.on('new-comment', (data: Notification) => {
      console.log('Nova notificação recebida:', data);
      this.addNotification(data);
    });

    // Inicializa notificações
    this.initializeNotifications();
    this.watchForUserIdAndFetchNotifications(); // Monitora o userId
  }

  initializeNotifications() {
    console.log('Inicializando notificações...');
    if (this.userId) {
      console.log('User ID encontrado durante a inicialização:', this.userId);
      this.fetchNotifications(this.userId);
    } else {
      console.log('User ID não encontrado durante a inicialização. Aguardando...');
    }
  }

  fetchNotifications(userId: string) {
    console.log('Buscando notificações para o User ID:', userId);
    this.http
      .get<Notification[]>(`http://localhost:3000/api/comments/${userId}/notifications`)
      .subscribe(
        (notifications) => {
          const validNotifications = notifications.filter(n => n.message && n.postId);
          console.log('Notificações válidas recebidas:', validNotifications);
          this.notificationsSubject.next(validNotifications);
        },
        (error) => {
          console.error('Erro ao recuperar notificações do banco de dados:', error);
        }
      );
  }

  private addNotification(notification: Notification) {
    if (notification && notification.message && notification.postId) {
      const currentNotifications = this.notificationsSubject.value;
      const updatedNotifications = [...currentNotifications, notification];
      this.notificationsSubject.next(updatedNotifications);
      console.log('Notificação adicionada:', notification);
    } else {
      console.warn('Notificação inválida recebida e não foi adicionada:', notification);
    }
  }

  private watchForUserIdAndFetchNotifications() {
    console.log('Iniciando monitoramento para o User ID...');
    const intervalId = setInterval(() => {
      this.userId = localStorage.getItem('userId'); // Atualiza o userId

      if (this.userId) {
        console.log('User ID encontrado:', this.userId);
        this.fetchNotifications(this.userId); // Busca as notificações
        clearInterval(intervalId); // Limpa o intervalo uma vez que o userId foi encontrado
        console.log('Monitoramento para User ID encerrado.');
      } else {
        console.log('Aguardando userId...');
      }
    }, 1000); // Verifica a cada 1 segundo
  }

  // Método para desconectar o socket (opcional)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Desconectado do servidor Socket.IO');
    }
  }
}
