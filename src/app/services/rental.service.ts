import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chef } from '../models/chef';
import { Rental, RentalRequest } from '../models/rental';

/** Turns a failed API call into a short Hungarian message for the user (never a raw HTTP dump). */
export function rentalErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error && typeof error.error === 'object' ? (error.error as { message?: unknown }).message : null;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    // No network (0), or a gateway/proxy error without an API error body: the API is not running.
    if (error.status === 0 || [502, 503, 504].includes(error.status) || error.status >= 500) {
      return 'A szerver nem érhető el. Ellenőrizze, hogy a Spring Boot API fut-e (alapértelmezetten a http://localhost:8080 címen).';
    }
  }
  return 'A foglalást most nem sikerült elküldeni. Kérjük, ellenőrizze az adatokat, és próbálja újra.';
}

@Injectable({ providedIn: 'root' })
export class RentalService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/berlesek`;

  /** Request body for POST /api/berlesek; totalPrice is never sent, the server calculates it. */
  buildRequest(chef: Chef, startDate: string, endDate: string): RentalRequest {
    return {
      uid: environment.userId,
      chefId: chef.id,
      startDate,
      endDate,
      dailyRate: chef.dailyRate,
      baseFee: chef.baseFee,
    };
  }

  create(request: RentalRequest): Observable<Rental> {
    return this.http.post<Rental>(this.url, request);
  }
}
