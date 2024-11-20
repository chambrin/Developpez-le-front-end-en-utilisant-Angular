// detail.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { Chart, ChartType } from 'chart.js';
import { Olympic } from '../../core/models/Olympic';
import { OlympicService } from '../../core/services/olympic.service';

@Component({
  selector: 'app-detail',
  template: `
    <div class="container" *ngIf="country$ | async as country">
      <button (click)="onBack()">Retour</button>
      <h2>{{ country.country }}</h2>

      <div class="stats">
        <div>Participations: {{ country.participations.length }}</div>
        <div>Total médailles: {{ getTotalMedals(country) }}</div>
        <div>Total athlètes: {{ getTotalAthletes(country) }}</div>
      </div>

      <div class="chart-container">
        <canvas #lineChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
    }
    .chart-container {
      height: 400px;
      width: 800px;
      margin: 20px auto;
    }
  `]
})
export class DetailComponent implements OnInit {
  @ViewChild('lineChart') lineChart!: ElementRef;
  country$!: Observable<Olympic | undefined>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.country$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.olympicService.getOlympics().pipe(
        map(olympics => {
          const country = olympics?.find(olympic => olympic.id === +id);
          if (country) {
            setTimeout(() => this.createLineChart(country), 0);
          }
          return country;
        })
      ))
    );
  }


  private createLineChart(country: Olympic): void {
    const ctx = this.lineChart?.nativeElement?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line' as ChartType,
      data: {
        labels: country.participations.map(p => p.year.toString()),
        datasets: [{
          label: 'Nombre de médailles',
          data: country.participations.map(p => p.medalsCount),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          tension: 0.1,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Nombre de médailles'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 10,
              padding: 10,
              font: {
                size: 12 
              }
            }
          }
        }
      }
    });
  }


  getTotalMedals(country: Olympic): number {
    return country.participations.reduce((sum, p) => sum + p.medalsCount, 0);
  }

  getTotalAthletes(country: Olympic): number {
    return country.participations.reduce((sum, p) => sum + p.athleteCount, 0);
  }

  onBack(): void {
    this.router.navigate(['/']);
  }
}
