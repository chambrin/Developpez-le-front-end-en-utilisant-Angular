import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import {Olympic} from "../../core/models/Olympic";
import {OlympicService} from "../../core/services/olympic.service";


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public country$!: Observable<Olympic | undefined>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.country$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.olympicService.getOlympics().pipe(
        map(olympics => olympics?.find(olympic => olympic.id === +id))
      ))
    );
  }

  getTotalMedals(country: Olympic): number {
    return country.participations.reduce((total, p) => total + p.medalsCount, 0);
  }

  getTotalAthletes(country: Olympic): number {
    return country.participations.reduce((total, p) => total + p.athleteCount, 0);
  }

  onBack(): void {
    this.router.navigate(['/']);
  }
}
