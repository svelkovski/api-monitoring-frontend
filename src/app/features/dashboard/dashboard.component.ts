import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import {
  interval,
  Subscription,
  switchMap,
  startWith,
  catchError,
  EMPTY,
} from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Api } from '../../core/model/api.model';
import { CreateApiRequest } from '../../core/model/create-api-request.model';
import { ApiModalComponent } from './api-modal/api-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ApiModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  apis: Api[] = [];

  loading = true;
  error = '';
  username = '';

  showModal = false;

  editingApi: Api | null = null;
  confirmDeleteId: number | null = null;

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private subscription?: Subscription;

  ngOnInit() {
    this.username = this.authService.getUsername();

    this.subscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.apiService.getAll().pipe(
            catchError(() => {
              this.loading = false;
              this.error = 'Unable to reach server. Retrying shortly...';
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe({
        next: (page) => {
          this.apis = page.content;
          this.loading = false;
          this.error = '';
        },
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCreate() {
    this.editingApi = null;
    this.showModal = true;
  }

  openEdit(api: Api, event: Event) {
    event.stopPropagation();
    this.editingApi = api;
    this.showModal = true;
  }

  deleteApi(api: Api, event: Event) {
    event.stopPropagation();
    this.confirmDeleteId = api.id;
  }

  confirmDelete(api: Api, event: Event) {
    event.stopPropagation();
    this.apiService.delete(api.id).subscribe({
      next: () => {
        this.apis = this.apis.filter((a) => a.id !== api.id);
        this.confirmDeleteId = null;
      },
      error: () => {
        this.error = 'Failed to delete API';
        this.confirmDeleteId = null;
      },
    });
  }

  cancelDelete(event: Event) {
    event.stopPropagation();
    this.confirmDeleteId = null;
  }

  closeModal() {
    this.showModal = false;
    this.editingApi = null;
  }

  onApiSaved() {
    this.closeModal();
    this.apiService.getAll().subscribe((page) => (this.apis = page.content));
  }

  get uptimePercent(): number {
    if (this.apis.length === 0) return 100;
    return Math.round((this.upCount / this.apis.length) * 100);
  }

  get uptimeColor(): string {
    if (this.uptimePercent === 100) return 'text-green-900';
    if (this.uptimePercent >= 80) return 'text-amber-600';
    return 'text-red-600';
  }

  get avgResponseTime(): number {
    const withData = this.apis.filter((a) => a.responseTime);
    if (withData.length === 0) return 0;
    return Math.round(
      withData.reduce((sum, a) => sum + (a.responseTime ?? 0), 0) /
        withData.length,
    );
  }

  get upCount() {
    return this.apis.filter((a) => a.status === 'UP').length;
  }
  get downCount() {
    return this.apis.filter((a) => a.status === 'DOWN').length;
  }
  get unknownCount() {
    return this.apis.filter((a) => a.status === 'UNKNOWN').length;
  }
}
