import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
export class HomeComponent implements OnInit {
  @ViewChild('pieChart') pieChart!: ElementRef;
  olympics$!: Observable<Olympic[] | null>;

  constructor(
    private olympicService: OlympicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    this.olympicService.loadInitialData().subscribe({
      next: (data) => {
        if (data) {
          setTimeout(() => this.createChart(data), 0);
        }
      },
      error: (error) => console.error('Erreur:', error)
    });
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
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
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
            callbacks: {
              label: (context) => {
                return `${context.raw} médailles`;
              }
            }
          }
        }
      }
    });
  }
}

