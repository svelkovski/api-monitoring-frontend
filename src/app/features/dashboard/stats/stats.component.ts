import { Component, Input, input } from '@angular/core';
import { Api } from '../../../core/model/api.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  @Input({ required: true }) apis: Api[] = [];

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
