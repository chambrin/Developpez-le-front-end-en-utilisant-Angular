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
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => {
                return `🏅 ${context.raw} médailles`;
              },
              title: (tooltipItems) => {
                return data[tooltipItems[0].dataIndex].country;
              }
            }
          },
        }
      }
    });
  }
}
