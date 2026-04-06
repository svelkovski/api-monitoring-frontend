import { Component } from '@angular/core';
import { SidebarComponent } from '../dashboard/sidebar/sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Check } from '../../core/model/check.model';
import { ApiService } from '../../core/services/api.service';
import { ResponseTimeChartComponent } from './response-time-chart/response-time-chart.component';
import { Api } from '../../core/model/api.model';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-api-details',
  standalone: true,
  imports: [SidebarComponent, ResponseTimeChartComponent, DatePipe, NgClass],
  templateUrl: './api-details.component.html',
  styleUrl: './api-details.component.css',
})
export class ApiDetailsComponent {
  api: Api | null = null;
  checks: Check[] = [];
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  checksLoading = false;
  error = '';
  private apiId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.apiId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadApi();

    this.loadChecks(0);
  }

  loadApi() {
    this.loading = true;
    this.apiService.getById(this.apiId).subscribe({
      next: (api) => {
        this.api = api;
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      },
    });
  }

  loadChecks(page: number) {
    this.checksLoading = true;
    this.apiService.getChecks(this.apiId, page, this.pageSize).subscribe({
      next: (res) => {
        this.checks = res.content;
        this.totalPages = res.totalPages;
        this.currentPage = res.number;
        this.checksLoading = false;
      },
      error: () => {
        this.error = 'Failed to load checks';
        this.checksLoading = false;
      },
    });
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.loadChecks(page);
  }

  getStatusBg(code: number): string {
    if (code >= 200 && code < 300) return 'bg-green-50 text-green-700';
    if (code === 0) return 'bg-red-50 text-red-600';
    return 'bg-amber-50 text-amber-600';
  }
}
