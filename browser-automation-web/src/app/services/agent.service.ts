import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationDetail,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/chat`;

  listConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.base}/conversations`);
  }

  createConversation(title = 'New conversation'): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.base}/conversations`, { title });
  }

  getConversation(conversationId: string): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(`${this.base}/conversations/${conversationId}`);
  }

  sendMessage(payload: ChatRequest): Observable<ChatResponse> {
    const body: Record<string, unknown> = {
      message: payload.message,
      headless: payload.headless ?? false,
    };
    if (payload.conversation_id) {
      body['conversation_id'] = payload.conversation_id;
    }
    if (payload.website) {
      body['website'] = payload.website;
    }
    return this.http.post<ChatResponse>(this.base, body);
  }
}
