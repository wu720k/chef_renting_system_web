import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chef, ChefLoadResult } from '../models/chef';

const FALLBACK_URL = 'assets/data/chefs.json';

/** Case-insensitive search in the chef name and cuisine; an empty/blank term returns everything. */
export function filterChefs(chefs: Chef[], term: string): Chef[] {
  const q = term.trim().toLowerCase();
  if (!q) {
    return chefs;
  }
  return chefs.filter((c) => c.name.toLowerCase().includes(q) || c.cuisine.toLowerCase().includes(q));
}

/**
 * Converts a remote JSON document into Chef objects. Accepts an array or an object keyed by id
 * (Firebase Realtime Database style) and a few common field spellings. Entries without a usable
 * id or name are skipped.
 */
export function normalizeChefs(raw: unknown): Chef[] {
  const entries: [string | number, unknown][] = Array.isArray(raw)
    ? raw.map((v, i) => [i, v] as [number, unknown])
    : raw && typeof raw === 'object'
      ? Object.entries(raw as Record<string, unknown>)
      : [];

  const chefs: Chef[] = [];
  for (const [key, value] of entries) {
    if (!value || typeof value !== 'object') {
      continue;
    }
    const r = value as Record<string, unknown>;
    const pick = (...names: string[]): unknown => names.map((n) => r[n]).find((v) => v !== undefined && v !== null);
    const id = Number(pick('id', 'chefId', 'chefid') ?? key);
    const name = String(pick('name', 'chefName', 'chefname') ?? '').trim();
    if (!Number.isFinite(id) || !name) {
      continue;
    }
    chefs.push({
      id,
      name,
      cuisine: String(pick('cuisine', 'cuisineType', 'konyhaTipus') ?? '').trim(),
      description: String(pick('description', 'bio', 'leiras') ?? '').trim(),
      image: String(pick('image', 'imageUrl', 'img', 'photo') ?? '').trim(),
      baseFee: Number(pick('baseFee', 'base_fee', 'basefee', 'alapDij') ?? 0) || 0,
      dailyRate: Number(pick('dailyRate', 'daily_rate', 'dailyrate', 'napiDij') ?? 0) || 0,
    });
  }
  return chefs;
}

@Injectable({ providedIn: 'root' })
export class ChefService {
  private readonly http = inject(HttpClient);

  /** Loads the chefs from environment.chefsUrl; if that is empty or fails, from the local fallback file. */
  load(): Observable<ChefLoadResult> {
    const url = environment.chefsUrl;
    if (!url) {
      return this.loadFallback(false);
    }
    return this.http.get<unknown>(url).pipe(
      map((raw) => normalizeChefs(raw)),
      switchMap((chefs) =>
        chefs.length ? of<ChefLoadResult>({ chefs, source: 'remote', remoteFailed: false }) : throwError(() => new Error('empty')),
      ),
      catchError(() => this.loadFallback(true)),
    );
  }

  private loadFallback(remoteFailed: boolean): Observable<ChefLoadResult> {
    return this.http.get<Chef[]>(FALLBACK_URL).pipe(
      map((chefs) => ({ chefs, source: 'fallback' as const, remoteFailed })),
    );
  }
}
