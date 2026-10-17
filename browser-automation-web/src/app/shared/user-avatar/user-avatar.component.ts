import { NgClass } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { ImageViewerService } from '../../core/image-viewer.service';
import { User } from '../../models/api.models';

type AvatarSize = 'sm' | 'md' | 'lg' | 'chat';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  private readonly viewer = inject(ImageViewerService);

  @Input() user: User | null = null;
  @Input() avatarUser: User | null = null;
  @Input() size: AvatarSize | number = 'md';
  @Input() clickable = true;

  get resolvedUser(): User | null {
    return this.avatarUser ?? this.user;
  }

  get sizeClass(): string {
    return typeof this.size === 'number' ? '' : `avatar--${this.size}`;
  }

  get pixelSize(): number | null {
    return typeof this.size === 'number' ? this.size : null;
  }

  get imageUrl(): string | null {
    const src = this.resolvedUser?.profile_image?.trim();
    return src || null;
  }

  get placeholderText(): string {
    const name = this.resolvedUser?.name?.trim() ?? '?';
    const parts = name.split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get canView(): boolean {
    return this.clickable && !!this.imageUrl;
  }

  openViewer(event: Event): void {
    if (!this.canView) {
      return;
    }
    event.stopPropagation();
    this.viewer.open(this.imageUrl!, this.resolvedUser?.name ?? 'Profile photo');
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.canView) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openViewer(event);
    }
  }
}
