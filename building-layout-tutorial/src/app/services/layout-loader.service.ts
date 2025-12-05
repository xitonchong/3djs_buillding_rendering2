import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { LayoutConfiguration } from '../models/layout-config.interface';

@Injectable({
  providedIn: 'root'
})
export class LayoutLoaderService {
  private readonly JSON_PATH = 'assets/sample-data/building-layout.json';

  constructor(private http: HttpClient) { }

  /**
   * Load building layout configuration from JSON file
   * @returns Observable of LayoutConfiguration
   */
  loadFromFile(): Observable<LayoutConfiguration> {
    return this.http.get<LayoutConfiguration>(this.JSON_PATH).pipe(
      catchError(error => {
        console.error('Failed to load building layout configuration:', error);
        return throwError(() => new Error('Failed to load building layout configuration. Please ensure the file exists at ' + this.JSON_PATH));
      })
    );
  }
}
