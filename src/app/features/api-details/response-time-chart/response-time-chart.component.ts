import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js';
import { Check } from '../../../core/model/check.model';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
);

@Component({
  selector: 'app-response-time-chart',
  standalone: true,
  template: `<div style="height: 300px"><canvas #canvas></canvas></div>`,
})
export class ResponseTimeChartComponent implements OnChanges, AfterViewInit {
  @Input() checks: Check[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private ready = false;

  ngAfterViewInit() {
    this.ready = true;
    this.buildChart();
  }

  ngOnChanges() {
    if (this.ready) this.buildChart();
  }

  private buildChart() {
    const sorted = [...this.checks].reverse();
    const labels = sorted.map((c) =>
      new Date(c.checkedAt).toLocaleTimeString(),
    );
    const data = sorted.map((c) => c.responseTime ?? 0);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: '#111827',
            backgroundColor: 'rgba(17,24,39,0.05)',
            borderWidth: 1.5,
            pointRadius: 3,
            pointBackgroundColor: '#111827',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index' },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#9ca3af' },
          },
          y: {
            grid: { color: '#f3f4f6' },
            ticks: {
              font: { size: 11 },
              color: '#9ca3af',
              callback: (v) => v + 'ms',
            },
          },
        },
      },
    });
  }
}
