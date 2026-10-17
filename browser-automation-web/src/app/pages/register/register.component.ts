import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthShellComponent } from '../../layouts/auth-shell/auth-shell.component';
import { JobProfile, UserRole, WorkMode } from '../../models/api.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, AuthShellComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** 0 role → 1 account → 2 password → 3 job profile → 4 review → 5 success */
  step = 0;
  readonly lastFormStep = 4;
  error = '';
  loading = false;
  success = false;
  selectedRole: UserRole = 'user';
  showPassword = false;
  showConfirmPassword = false;

  readonly workModes: { value: WorkMode; label: string }[] = [
    { value: 'any', label: 'Any' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    adminCode: [''],
    job_profile: this.fb.nonNullable.group({
      target_role: ['', Validators.required],
      skills: ['', Validators.required],
      experience_years: [0, [Validators.required, Validators.min(0), Validators.max(60)]],
      preferred_locations: ['', Validators.required],
      work_mode: ['any' as WorkMode],
      education: [''],
      salary_expectation: [''],
      resume_url: [''],
      professional_summary: [''],
    }),
  });

  progressSteps(): number[] {
    return [0, 1, 2, 3, 4];
  }

  chooseRole(role: UserRole): void {
    this.selectedRole = role;
    this.error = '';
    this.step = 1;
  }

  back(): void {
    this.error = '';
    if (this.step > 0) {
      this.step -= 1;
    }
  }

  continue(): void {
    this.error = '';
    if (this.step === 1 && !this.validateAccountStep()) {
      return;
    }
    if (this.step === 2 && !this.validatePasswordStep()) {
      return;
    }
    if (this.step === 3 && !this.validateJobStep()) {
      return;
    }
    if (this.step < this.lastFormStep) {
      this.step += 1;
    }
  }

  skipJobProfile(): void {
    if (this.selectedRole !== 'admin') {
      return;
    }
    this.error = '';
    this.step = 4;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit(): void {
    const { name, email, password, adminCode, job_profile } = this.form.getRawValue();
    if (!this.validatePasswordStep()) {
      this.step = 2;
      return;
    }
    if (this.selectedRole === 'user' && !this.validateJobStep()) {
      this.step = 3;
      return;
    }

    const payloadJobProfile = this.buildJobProfile(job_profile);
    this.loading = true;
    this.error = '';

    this.auth
      .register({
        name,
        email,
        password,
        role: this.selectedRole,
        admin_code: this.selectedRole === 'admin' ? adminCode : undefined,
        job_profile: payloadJobProfile,
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.step = 5;
          setTimeout(() => this.router.navigate(['/app/dashboard']), 1400);
        },
        error: (err) => {
          const detail = err.error?.detail;
          if (Array.isArray(detail)) {
            this.error = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(' ') || 'Registration failed';
          } else {
            this.error = detail ?? 'Registration failed';
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  jobProfileSummary(): JobProfile | null {
    return this.buildJobProfile(this.form.getRawValue().job_profile);
  }

  private validateAccountStep(): boolean {
    const { name, email } = this.form.getRawValue();
    if (!name?.trim() || !email?.trim()) {
      this.form.markAllAsTouched();
      this.error = 'Enter your name and email.';
      return false;
    }
    if (this.form.controls.email.invalid) {
      this.error = 'Enter a valid email address.';
      return false;
    }
    return true;
  }

  private validatePasswordStep(): boolean {
    const { password, confirmPassword, adminCode } = this.form.getRawValue();
    if (!password || password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return false;
    }
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return false;
    }
    if (this.selectedRole === 'admin' && !adminCode?.trim()) {
      this.error = 'Admin registration code is required.';
      return false;
    }
    return true;
  }

  private validateJobStep(): boolean {
    if (this.selectedRole === 'admin') {
      const profile = this.form.controls.job_profile.getRawValue();
      const hasAny =
        profile.target_role.trim() ||
        profile.skills.trim() ||
        profile.preferred_locations.trim();
      if (!hasAny) {
        return true;
      }
    }

    const job = this.form.controls.job_profile;
    job.markAllAsTouched();
    if (job.invalid) {
      this.error = 'Fill in role, skills, experience, and preferred locations for job search.';
      return false;
    }
    const { target_role, skills, preferred_locations } = job.getRawValue();
    if (!target_role.trim() || !skills.trim() || !preferred_locations.trim()) {
      this.error = 'Fill in role, skills, experience, and preferred locations for job search.';
      return false;
    }
    return true;
  }

  private buildJobProfile(raw: {
    target_role: string;
    skills: string;
    experience_years: number;
    preferred_locations: string;
    work_mode: WorkMode;
    education: string;
    salary_expectation: string;
    resume_url: string;
    professional_summary: string;
  }): JobProfile | null {
    const hasCore =
      raw.target_role.trim() &&
      raw.skills.trim() &&
      raw.preferred_locations.trim();

    if (this.selectedRole === 'user') {
      return {
        target_role: raw.target_role.trim(),
        skills: raw.skills.trim(),
        experience_years: raw.experience_years,
        preferred_locations: raw.preferred_locations.trim(),
        work_mode: raw.work_mode,
        education: raw.education.trim() || null,
        salary_expectation: raw.salary_expectation.trim() || null,
        resume_url: raw.resume_url.trim() || null,
        professional_summary: raw.professional_summary.trim() || null,
      };
    }

    if (!hasCore) {
      return null;
    }

    return {
      target_role: raw.target_role.trim(),
      skills: raw.skills.trim(),
      experience_years: raw.experience_years,
      preferred_locations: raw.preferred_locations.trim(),
      work_mode: raw.work_mode,
      education: raw.education.trim() || null,
      salary_expectation: raw.salary_expectation.trim() || null,
      resume_url: raw.resume_url.trim() || null,
      professional_summary: raw.professional_summary.trim() || null,
    };
  }
}
