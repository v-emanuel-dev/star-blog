// src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro ao conectar ao servidor Socket.IO:', error);
    });

    this.socket.on('new-comment', (data) => {
      console.log('Nova notificação recebida:', data); // Log dos dados da notificação
      this.addNotification(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado do servidor Socket.IO:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Erro no Socket.IO:', error);
    });
  }

  private addNotification(notification: any) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);
    console.log('Notificação adicionada:', notification); // Log para confirmar que a notificação foi adicionada
  }
}
