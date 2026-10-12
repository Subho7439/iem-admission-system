import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationItem } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/notifications';

  unreadCount = signal<number>(0);
  notifications = signal<NotificationItem[]>([]);

  fetchNotifications(): Observable<{ success: boolean; unreadCount: number; notifications: NotificationItem[] }> {
    return this.http.get<{ success: boolean; unreadCount: number; notifications: NotificationItem[] }>(this.apiUrl).pipe(
      tap(res => {
        if (res.success) {
          this.unreadCount.set(res.unreadCount);
          this.notifications.set(res.notifications);
        }
      })
    );
  }

  markAsRead(id: string): Observable<{ success: boolean; notification: NotificationItem }> {
    return this.http.put<{ success: boolean; notification: NotificationItem }>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(list =>
          list.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllAsRead(): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      })
    );
  }

  broadcast(title: string, message: string, targetRole: string = 'student'): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/broadcast`, {
      title,
      message,
      targetRole
    });
  }
}
