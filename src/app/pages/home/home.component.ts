import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router'; // Ajouter cet import
import { Observable } from 'rxjs';
import { Chart, ChartType } from 'chart.js';
import { Olympic } from "../../core/models/Olympic";
import { OlympicService } from "../../core/services/olympic.service";

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
          setTimeout(() => {
            this.createChart(data);
          }, 0);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
      }
    });
  }

  private getTotalMedals(country: Olympic): number {
    return country.participations.reduce((total, participation) =>
      total + participation.medalsCount, 0
    );
  }

  private createChart(data: Olympic[]): void {
    const canvas = this.pieChart?.nativeElement;
    const ctx = canvas?.getContext('2d');

    if (!ctx) {
      console.error('Impossible d\'obtenir le contexte 2D');
      return;
    }

    canvas.width = 400;
    canvas.height = 400;

    console.log('Création du graphique avec les données:', data);

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
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const countryId = data[index].id;
            this.router.navigate(['/detail', countryId]);
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value} médailles`;
              }
            }
          }
        }
      }
    });
  }
}
