// Import des modules nécessaires pour les Observables et composants Angular
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Import des opérateurs RxJS nécessaires pour la manipulation des flux de données
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { Chart, ChartType } from 'chart.js';
import { Olympic } from '../../core/models/Olympic';
import { OlympicService } from '../../core/services/olympic.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  // Référence au canvas pour le graphique
  @ViewChild('lineChart') lineChart!: ElementRef;

  // Déclaration d'un Observable qui va contenir les données du pays
  // Le $ est une convention de nommage pour les Observables
  // Le type peut être Olympic ou undefined car on gère le cas où le pays n'existe pas
  country$!: Observable<Olympic | undefined>;

  // Subject pour gérer le désabonnement
  private destroy$ = new Subject<void>();

  // Référence au graphique pour pouvoir le détruire
  private chart: Chart | undefined;

  constructor(
    private route: ActivatedRoute,   // Pour accéder aux paramètres de l'URL
    private router: Router,          // Pour la navigation
    private olympicService: OlympicService  // Service pour récupérer les données
  ) {}

  ngOnInit(): void {
    // Création d'une chaîne d'Observables pour traiter les données
    this.country$ = this.route.params.pipe(
      // Ajout du takeUntil pour gérer le désabonnement
      takeUntil(this.destroy$),
      // map : transforme les données de l'Observable. Ici, on extrait l'ID des paramètres
      map(params => params['id']),

      // switchMap : permet de basculer vers un nouvel Observable
      // Utilisé quand une valeur d'un Observable doit être utilisée pour créer un nouvel Observable
      // Annule automatiquement la souscription précédente si une nouvelle valeur arrive
      switchMap(id => this.olympicService.getOlympics().pipe(
        // Nouveau map pour transformer les données olympiques
        map(olympics => {
          // Recherche du pays correspondant à l'ID
          const country = olympics?.find(olympic => olympic.id === +id);

          // Si le pays n'est pas trouvé, redirection vers la page 404
          if (!country) {
            this.router.navigate(['/not-found']); // redirection vers une page 404 si la data ne sont pas disponibles
            return undefined;
          }

          // Création du graphique après le rendu du template
          // setTimeout utilisé pour s'assurer que le DOM est prêt
          setTimeout(() => this.createLineChart(country), 0);
          return country;
        })
      ))
    );
    // L'Observable final (country$) émettra les données du pays quand :
    // 1. Les paramètres de route changent
    // 2. Les données olympiques sont chargées
    // 3. Le pays correspondant est trouvé
  }

  // Méthode pour créer le graphique avec Chart.js
  private createLineChart(country: Olympic): void {
    const ctx = this.lineChart?.nativeElement?.getContext('2d');
    if (!ctx) return;

    // Destruction du graphique précédent s'il existe
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
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

  // Méthode utilitaire pour calculer le total des médailles d'un pays
  getTotalMedals(country: Olympic): number {
    return country.participations.reduce((sum, p) => sum + p.medalsCount, 0);
  }

  // Méthode utilitaire pour calculer le total des athlètes d'un pays
  getTotalAthletes(country: Olympic): number {
    return country.participations.reduce((sum, p) => sum + p.athleteCount, 0);
  }

  // Méthode de navigation pour retourner à la page d'accueil
  onBack(): void {
    this.router.navigate(['/']);
  }

  // Méthode pour nettoyer les ressources lors de la destruction du composant
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
