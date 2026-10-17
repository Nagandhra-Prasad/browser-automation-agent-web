import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SessionService } from '../../core/session.service';
import { JobProfile, User, WorkMode } from '../../models/api.models';
import { AuthService } from '../../services/auth.service';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { resizeProfileImage } from '../../shared/utils/resize-profile-image';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, UserAvatarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly fb = inject(FormBuilder);

  user = this.session.user;
  saving = false;
  uploading = false;
  error = '';
  success = '';
  previewImage: string | null = null;

  readonly workModes: { value: WorkMode; label: string }[] = [
    { value: 'any', label: 'Any' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120)]],
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

  get avatarUser(): User | null {
    if (!this.user) {
      return null;
    }
    return { ...this.user, profile_image: this.previewImage };
  }

  get isUserRole(): boolean {
    return this.user?.role === 'user';
  }

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (user) => {
        this.applyUser(user);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.error = 'Please choose an image file.';
      return;
    }
    this.uploading = true;
    resizeProfileImage(file)
      .then((dataUrl) => {
        this.previewImage = dataUrl;
        this.error = '';
      })
      .catch(() => {
        this.error = 'Could not process that image. Try another file.';
      })
      .finally(() => {
        this.uploading = false;
      });
  }

  removePhoto(): void {
    this.previewImage = null;
  }

  save(): void {
    if (this.form.controls.name.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const jobProfile = this.buildJobProfile();
    if (this.isUserRole && !jobProfile) {
      this.form.controls.job_profile.markAllAsTouched();
      this.error = 'Complete your job search profile so the agent can find relevant roles.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    const { name } = this.form.getRawValue();
    const currentImage = this.user?.profile_image ?? null;
    const profileImage =
      this.previewImage === currentImage
        ? undefined
        : this.previewImage === null
          ? ''
          : this.previewImage;

    const payload: {
      name: string;
      profile_image?: string;
      job_profile?: JobProfile | null;
    } = { name };

    if (profileImage !== undefined) {
      payload.profile_image = profileImage;
    }

    if (this.isUserRole || jobProfile) {
      payload.job_profile = jobProfile;
    }

    this.auth.updateProfile(payload).subscribe({
      next: (user) => {
        this.applyUser(user);
        this.success = 'Profile updated successfully.';
        this.saving = false;
      },
      error: (err) => {
        this.error = err.error?.detail ?? 'Failed to update profile';
        this.saving = false;
      },
    });
  }

  private applyUser(user: User): void {
    this.user = user;
    this.form.patchValue({ name: user.name });
    this.previewImage = user.profile_image ?? null;
    this.patchJobProfile(user.job_profile);
    if (user.role !== 'user') {
      this.clearJobValidators();
    }
  }

  private patchJobProfile(profile: JobProfile | null | undefined): void {
    const job = this.form.controls.job_profile;
    job.patchValue({
      target_role: profile?.target_role ?? '',
      skills: profile?.skills ?? '',
      experience_years: profile?.experience_years ?? 0,
      preferred_locations: profile?.preferred_locations ?? '',
      work_mode: profile?.work_mode ?? 'any',
      education: profile?.education ?? '',
      salary_expectation: profile?.salary_expectation ?? '',
      resume_url: profile?.resume_url ?? '',
      professional_summary: profile?.professional_summary ?? '',
    });
  }

  private clearJobValidators(): void {
    const job = this.form.controls.job_profile;
    Object.values(job.controls).forEach((control) => {
      control.clearValidators();
      control.updateValueAndValidity();
    });
  }

  private buildJobProfile(): JobProfile | null {
    const raw = this.form.controls.job_profile.getRawValue();
    const hasCore =
      raw.target_role.trim() &&
      raw.skills.trim() &&
      raw.preferred_locations.trim();

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
