import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MovementLimit } from '../models/movement-limit.interface';

/**
 * Service for loading movement limit configurations from JSON file
 *
 * Loads movement-limits.json from assets/data directory and handles errors gracefully.
 * Missing or malformed configuration files result in empty array (no limits enforced).
 */
@Injectable({
  providedIn: 'root'
})
export class MovementLimitLoaderService {
  private readonly CONFIG_PATH = 'assets/data/movement-limits.json';

  constructor(private http: HttpClient) {}

  /**
   * Load movement limit configurations from JSON file
   *
   * @returns Observable emitting array of MovementLimit objects
   *          Empty array if file not found or invalid JSON
   */
  loadLimits(): Observable<MovementLimit[]> {
    return this.http.get<MovementLimit[]>(this.CONFIG_PATH).pipe(
      catchError((error) => {
        if (error.status === 404) {
          console.warn('Movement limits file not found, using no limits');
        } else {
          console.error('Failed to parse movement limits:', error);
        }
        return of([]);
      })
    );
  }
}
