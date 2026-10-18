import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { OnboardingStep, OnboardingStepIcon } from '../../models/api.models';

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  templateUrl: './onboarding-tour.component.html',
  styleUrl: './onboarding-tour.component.scss',
})
export class OnboardingTourComponent implements OnInit {
  @Input({ required: true }) steps: OnboardingStep[] = [];
  @Output() finished = new EventEmitter<void>();

  index = 0;

  ngOnInit(): void {
    this.highlightTarget();
  }

  get step(): OnboardingStep {
    return this.steps[this.index];
  }

  get isLast(): boolean {
    return this.index >= this.steps.length - 1;
  }

  get progressPercent(): number {
    if (!this.steps.length) {
      return 0;
    }
    return ((this.index + 1) / this.steps.length) * 100;
  }

  get stepIcon(): OnboardingStepIcon {
    if (this.step.icon) {
      return this.step.icon;
    }
    return this.iconForTarget(this.step.target);
  }

  private iconForTarget(target: string): OnboardingStepIcon {
    switch (target) {
      case 'tour-dashboard':
        return 'dashboard';
      case 'tour-chat':
        return 'chat';
      case 'tour-results':
        return 'results';
      case 'tour-conversations':
        return 'history';
      case 'tour-users':
        return 'users';
      default:
        return 'finish';
    }
  }

  next(): void {
    if (this.isLast) {
      this.clearHighlight();
      this.finished.emit();
      return;
    }
    this.index += 1;
    this.highlightTarget();
  }

  skip(): void {
    this.clearHighlight();
    this.finished.emit();
  }

  private highlightTarget(): void {
    this.clearHighlight();
    // Final step is a summary — highlighting the whole dashboard stacks above the modal.
    if (this.isLast || this.step.target === 'tour-finish') {
      return;
    }
    const el = document.querySelector(`[data-tour="${this.step.target}"]`);
    el?.classList.add('tour-highlight');
  }

  private clearHighlight(): void {
    document.querySelectorAll('.tour-highlight').forEach((el) => el.classList.remove('tour-highlight'));
  }
}
