import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {Olympic} from "../../core/models/Olympic";
import {OlympicService} from "../../core/services/olympic.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  olympics$!: Observable<Olympic[] | null>;

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    this.olympicService.loadInitialData().subscribe({
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
      }
    });
  }

  getTotalMedals(country: Olympic): number {
    return country.participations.reduce((total, participation) =>
      total + participation.medalsCount, 0);
  }
}
