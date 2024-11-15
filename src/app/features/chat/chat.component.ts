import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService, Message } from './chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="messages-container">
        <div
          *ngFor="let message of messages"
          [ngClass]="{
            sent: message.sender._id === currentUserId,
            received: message.sender._id !== currentUserId
          }"
          class="message-bubble"
        >
          <strong>{{ message.sender.username }}</strong>
          <p>{{ message.content }}</p>
          <small>{{ message.createdAt | date : 'short' }}</small>
        </div>
      </div>

      <div class="input-area">
        <input
          [(ngModel)]="newMessage"
          (keyup.enter)="sendMessage()"
          placeholder="Type a message..."
          class="message-input"
        />
        <button (click)="sendMessage()" class="send-button">Send</button>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-container {
        display: flex;
        flex-direction: column;
        height: 80vh;
        margin: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .message-bubble {
        max-width: 70%;
        padding: 10px;
        border-radius: 10px;
        margin: 5px;
      }

      .sent {
        align-self: flex-end;
        background-color: #007bff;
        color: white;
      }

      .received {
        align-self: flex-start;
        background-color: #f1f1f1;
      }

      .input-area {
        display: flex;
        padding: 20px;
        gap: 10px;
        border-top: 1px solid #ddd;
      }

      .message-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .send-button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .send-button:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  private itemId: string = '';
  private ownerId: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get current user from localStorage
    const userId = localStorage.getItem('_id');
    if (userId) {
      // Remove quotes if they exist
      this.currentUserId = userId.replace(/['"]+/g, '');
    }

    // Get route parameters
    this.route.params.subscribe((params) => {
      this.itemId = params['itemId'];
      this.ownerId = params['ownerId'];

      // Connect to socket
      this.chatService.connect(this.currentUserId);

      // Load existing messages
      this.loadMessages();
    });

    // Subscribe to new messages
    this.subscriptions.push(
      this.chatService.messages$.subscribe((messages) => {
        this.messages = messages;
      })
    );
  }

  loadMessages() {
    this.subscriptions.push(
      this.chatService
        .getConversationMessages(this.currentUserId, this.ownerId)
        .subscribe({
          next: (response: any) => {
            if (response.success && response.data) {
              this.messages = response.data;
            }
          },
          error: (error) => console.error('Error loading messages:', error),
        })
    );
  }

  sendMessage() {
    if (this.newMessage.trim() && this.currentUserId) {
      this.chatService.sendMessage({
        receiverId: this.ownerId,
        itemId: this.itemId,
        content: this.newMessage.trim(),
        senderId: this.currentUserId,
      });
      this.newMessage = '';
    }
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
