import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<any>(this.olympicUrl).pipe(
      tap((value) => {
        this.olympics$.next(value);
        this.error$.next(null);
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
        }

        this.olympics$.next(null);
        this.error$.next(errorMessage);
        return throwError(() => errorMessage);
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }
}
