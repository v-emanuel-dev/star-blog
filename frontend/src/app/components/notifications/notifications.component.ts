import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notificationsCart: string[] = [];
  private notificationSubscription!: Subscription;

  constructor(
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    // Assina o Observable de notificações
    this.notificationSubscription = this.webSocketService.removeFromCart$.subscribe({
      next: (message: string) => {
        this.notificationsCart.push(message);
      }
    });
  }

  ngOnDestroy(): void {
    // Cancela a assinatura quando o componente for destruído
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  clearNotifications(): void {
    this.notificationsCart = [];
  }
}
