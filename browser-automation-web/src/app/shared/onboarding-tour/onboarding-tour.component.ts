import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { OnboardingStep } from '../../models/api.models';

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
    const el = document.querySelector(`[data-tour="${this.step.target}"]`);
    el?.classList.add('tour-highlight');
  }

  private clearHighlight(): void {
    document.querySelectorAll('.tour-highlight').forEach((el) => el.classList.remove('tour-highlight'));
  }
}
