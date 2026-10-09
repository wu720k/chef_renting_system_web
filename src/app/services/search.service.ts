import { Injectable, signal } from '@angular/core';

/** Shared search text: the navbar search field writes it, the chef list filters by it. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly term = signal('');
}
