import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Chart, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Olympic } from "../../core/models/Olympic";
import { OlympicService } from "../../core/services/olympic.service";

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('pieChart') pieChart!: ElementRef;
  olympics$!: Observable<Olympic[] | null>;
  private subscription: Subscription = new Subscription();

  constructor(
    private olympicService: OlympicService,
    private router: Router
  ) {}

  protected getNumberOfJOs(data: Olympic[]): number {
    if (!data || data.length === 0) return 0;
    return data[0].participations.length;
  }

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    const sub = this.olympicService.loadInitialData().subscribe({
      next: (data) => {
        if (data) {
          setTimeout(() => this.createChart(data), 0);
        }
      },
      error: (error) => console.error('Erreur:', error)
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getTotalMedals(country: Olympic): number {
    return country.participations.reduce((total, p) => total + p.medalsCount, 0);
  }

  private createChart(data: Olympic[]): void {
    const ctx = this.pieChart?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const styleElement = document.createElement('style');
    styleElement.textContent = `
      #chartjs-tooltip {
        background: #02838F;
        border-radius: 3px;
        color: white;
        opacity: 0;
        pointer-events: none;
        position: absolute;
        transform: translate(-50%, 0);
        transition: all .1s ease;
      }
      .tooltip-title {
        font-weight: bold;
        margin-bottom: 6px;
        text-align: center;
      }
      .tooltip-body {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .medal-icon {
        width: 20px;
        height: 20px;
      }
    `;
    document.head.appendChild(styleElement);

    new Chart(ctx, {
      type: 'pie' as ChartType,
      data: {
        labels: data.map(country => country.country),
        datasets: [{
          data: data.map(country => this.getTotalMedals(country)),
          backgroundColor: [
            'rgb(139, 94, 94)',
            'rgb(139, 94, 94)',
            'rgb(148, 169, 219)',
            'rgb(132, 105, 123)',
            'rgb(197, 212, 240)',
            'rgb(197, 212, 240)',
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 50
        },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const countryId = data[index].id;
            this.router.navigate(['/detail', countryId]);
          }
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#333',
            formatter: (value, context) => {
              return data[context.dataIndex].country;
            },
            font: {
              size: 14
            },
            align: 'end',
            anchor: 'end',
            offset: 20
          },
          tooltip: {
            enabled: false,
            external: (context) => {
              const tooltipEl = document.getElementById('chartjs-tooltip') ||
                (() => {
                  const el = document.createElement('div');
                  el.id = 'chartjs-tooltip';
                  document.body.appendChild(el);
                  return el;
                })();

              const tooltipModel = context.tooltip;

              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = '0';
                return;
              }

              if (tooltipModel.body) {
                const dataPoint = tooltipModel.dataPoints[0];
                const value = dataPoint.raw;
                const title = data[dataPoint.dataIndex].country;

                tooltipEl.innerHTML = `
        <div class="tooltip-title">${title}</div>
        <div class="tooltip-body">
          <img src="assets/Medal.png" class="medal-icon" alt="Medal icon" />
          <span>${value}</span>
        </div>
      `;
              }

              const position = context.chart.canvas.getBoundingClientRect();

              tooltipEl.style.fontSize = '14px';
              tooltipEl.style.opacity = '1';
              tooltipEl.style.padding = '8px 12px';

              const left = position.left + window.pageXOffset + tooltipModel.caretX;
              const top = position.top + window.pageYOffset + tooltipModel.caretY;

              tooltipEl.style.left = left + 'px';
              tooltipEl.style.top = top + 'px';
            }
          }
        }
      }
    });
  }
}
