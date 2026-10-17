declare module 'viewerjs' {
  export interface ViewerOptions {
    hidden?: () => void;
  }

  export default class Viewer {
    constructor(element: HTMLElement, options?: ViewerOptions);
    show(): void;
    destroy(): void;
  }
}
