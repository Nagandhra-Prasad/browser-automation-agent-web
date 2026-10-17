import { Routes } from '@angular/router';

import { adminGuard } from './core/admin.guard';
import { authGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ChatBootstrapComponent } from './pages/chat/chat-bootstrap.component';
import { ChatComponent } from './pages/chat/chat.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ConversationsComponent } from './pages/conversations/conversations.component';
import { ResultsComponent } from './pages/results/results.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'c',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [{ path: ':conversationId', component: ChatComponent }],
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'chat', pathMatch: 'full', component: ChatBootstrapComponent },
      { path: 'results', component: ResultsComponent },
      { path: 'conversations', component: ConversationsComponent },
      { path: 'users', component: UsersComponent, canActivate: [adminGuard] },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  { path: 'app/chat/:conversationId', redirectTo: 'c/:conversationId', pathMatch: 'full' },
  { path: '**', redirectTo: 'app/dashboard' },
];
