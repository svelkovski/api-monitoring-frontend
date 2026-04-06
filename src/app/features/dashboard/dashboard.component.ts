import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {
  interval,
  Subscription,
  switchMap,
  startWith,
  catchError,
  EMPTY,
} from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Api } from '../../core/model/api.model';
import { ApiModalComponent } from './api-modal/api-modal.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StatsComponent } from './stats/stats.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ApiModalComponent,
    SidebarComponent,
    StatsComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  apis: Api[] = [];

  loading = true;
  error = '';

  showModal = false;

  editingApi: Api | null = null;
  confirmDeleteId: number | null = null;

  private apiService = inject(ApiService);
  private subscription?: Subscription;

  ngOnInit() {
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
}
