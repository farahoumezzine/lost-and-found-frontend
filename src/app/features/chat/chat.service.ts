import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Message {
  _id?: string;
  sender: {
    _id: string;
    username: string;
  };
  receiver: {
    _id: string;
    username: string;
  };
  itemId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: false,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('message_received', (message: Message) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.socket.on('message_sent', (message: Message) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.socket.on('message_error', (error: string) => {
      console.error('Socket error:', error);
    });
  }

  connect(userId: string) {
    if (!this.socket.connected) {
      this.socket.connect();
      this.socket.emit('user_connected', userId);
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  sendMessage(messageData: {
    receiverId: string;
    itemId: string;
    content: string;
    senderId: string;
  }) {
    this.socket.emit('send_message', messageData);
  }

  getConversationMessages(
    senderId: string,
    receiverId: string
  ): Observable<any> {
    return this.http.get(
      `http://localhost:3000/api/chatbot/conversations/${senderId}/${receiverId}`
    );
  }
}
