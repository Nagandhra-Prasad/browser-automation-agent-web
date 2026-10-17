import { Injectable } from '@angular/core';
import Viewer from 'viewerjs';

@Injectable({ providedIn: 'root' })
export class ImageViewerService {
  private viewer?: Viewer;
  private host?: HTMLUListElement;

  open(src: string, title = 'Profile photo'): void {
    if (!src.trim()) {
      return;
    }

    this.destroy();

    const list = document.createElement('ul');
    list.className = 'app-image-viewer-host';
    const item = document.createElement('li');
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    item.appendChild(img);
    list.appendChild(item);
    document.body.appendChild(list);
    this.host = list;

    this.viewer = new Viewer(list, {
      navbar: false,
      title: [1, () => title],
      transition: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      hidden: () => this.destroy(),
      // viewerjs typings are stricter than runtime options
    } as never);

    this.viewer.show();
  }

  private destroy(): void {
    this.viewer?.destroy();
    this.viewer = undefined;
    this.host?.remove();
    this.host = undefined;
  }
}
