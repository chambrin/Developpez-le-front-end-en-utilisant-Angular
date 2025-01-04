// Import des modules nécessaires pour les requêtes HTTP et la gestion des erreurs
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Import des classes et opérateurs RxJS nécessaires
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {Olympic} from "../models/Olympic";

// Décorateur Injectable pour que le service puisse être injecté
// providedIn: 'root' signifie que le service est disponible dans toute l'application
@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  // URL du fichier JSON contenant les données
  private olympicUrl = './assets/mock/olympic.json';

  // BehaviorSubject pour stocker et émettre les données olympiques
  // BehaviorSubject conserve la dernière valeur émise et l'émet aux nouveaux abonnés
  // Le type peut être un tableau d'Olympic ou null
  private olympics$ = new BehaviorSubject<Olympic[] | null>(null);

  // BehaviorSubject pour gérer les messages d'erreur
  // Permet de stocker et d'émettre les erreurs survenues
  private error$ = new BehaviorSubject<string | null>(null);

  // Injection du service HttpClient pour effectuer les requêtes HTTP
  constructor(private http: HttpClient) {}

  // Méthode pour charger les données initiales
  loadInitialData() {
    // Effectue une requête GET HTTP et retourne un Observable
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      // tap : exécute une action sans modifier les données
      // Ici, met à jour les BehaviorSubjects avec les nouvelles données
      tap((value) => {
        this.olympics$.next(value);  // Met à jour les données olympiques
        this.error$.next(null);      // Réinitialise les erreurs
      }),
      // catchError : intercepte et gère les erreurs
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        // Différencie les erreurs client et serveur
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
        }

        // Met à jour les BehaviorSubjects en cas d'erreur
        this.olympics$.next(null);         // Réinitialise les données
        this.error$.next(errorMessage);    // Stocke le message d'erreur
        // Propage l'erreur aux abonnés
        return throwError(() => errorMessage);
      })
    );
  }

  // Méthode pour accéder aux données olympiques
  // Retourne un Observable des données olympiques
  // asObservable() empêche les composants de pouvoir émettre des valeurs  Séparation claire entre les données et les erreurs , pour empêcher l'émission externe de valeur
  getOlympics(): Observable<Olympic[] | null> {
    return this.olympics$.asObservable();
  }

  // Méthode pour accéder aux messages d'erreur
  // Retourne un Observable des messages d'erreur
  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }
}
