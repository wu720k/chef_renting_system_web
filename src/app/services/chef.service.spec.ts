import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Chef } from '../models/chef';
import { ChefService, filterChefs, normalizeChefs } from './chef.service';

const CHEFS: Chef[] = [
  { id: 1, name: 'Sophia Ricci', cuisine: 'Italian', description: '', image: '', baseFee: 245, dailyRate: 175 },
  { id: 2, name: 'David Keller', cuisine: 'French', description: '', image: '', baseFee: 270, dailyRate: 190 },
  { id: 3, name: 'Pamela Dawson', cuisine: 'American', description: '', image: '', baseFee: 275, dailyRate: 200 },
];

describe('filterChefs', () => {
  it('finds chefs by name', () => {
    expect(filterChefs(CHEFS, 'keller').map((c) => c.id)).toEqual([2]);
  });

  it('finds chefs by cuisine', () => {
    expect(filterChefs(CHEFS, 'italian').map((c) => c.id)).toEqual([1]);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(filterChefs(CHEFS, '  FRENCH ').map((c) => c.id)).toEqual([2]);
    expect(filterChefs(CHEFS, 'pAmEla').map((c) => c.id)).toEqual([3]);
  });

  it('returns the whole list for an empty or blank term (search cleared)', () => {
    expect(filterChefs(CHEFS, '')).toEqual(CHEFS);
    expect(filterChefs(CHEFS, '   ')).toEqual(CHEFS);
  });

  it('returns nothing when there is no match', () => {
    expect(filterChefs(CHEFS, 'sushi')).toEqual([]);
  });
});

describe('normalizeChefs', () => {
  it('accepts an array', () => {
    const chefs = normalizeChefs([{ id: 5, name: 'A', cuisine: 'X', baseFee: 10, dailyRate: 2 }]);
    expect(chefs).toEqual([{ id: 5, name: 'A', cuisine: 'X', description: '', image: '', baseFee: 10, dailyRate: 2 }]);
  });

  it('accepts the snake_case fee fields of the Firebase data', () => {
    const chefs = normalizeChefs([{ id: 1, name: 'A', cuisine: 'X', base_fee: 245, daily_rate: 175 }]);
    expect(chefs[0].baseFee).toBe(245);
    expect(chefs[0].dailyRate).toBe(175);
  });

  it('accepts an object keyed by id and skips invalid entries', () => {
    const chefs = normalizeChefs({ '7': { name: 'B', cuisine: 'Y' }, '8': null, '9': { cuisine: 'no name' } });
    expect(chefs.map((c) => c.id)).toEqual([7]);
  });

  it('returns an empty list for unusable input', () => {
    expect(normalizeChefs(null)).toEqual([]);
    expect(normalizeChefs('x')).toEqual([]);
  });
});

describe('ChefService', () => {
  let service: ChefService;
  let http: HttpTestingController;
  const originalUrl = environment.chefsUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ChefService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.chefsUrl = originalUrl;
    http.verify();
  });

  it('loads the local fallback file when no remote URL is configured', () => {
    environment.chefsUrl = '';
    let result: unknown;
    service.load().subscribe((r) => (result = r));
    http.expectOne('assets/data/chefs.json').flush(CHEFS);
    expect(result).toEqual({ chefs: CHEFS, source: 'fallback', remoteFailed: false });
  });

  it('uses the remote endpoint when it works', () => {
    environment.chefsUrl = 'https://example.test/chefs.json';
    let result: { source: string; chefs: Chef[] } | undefined;
    service.load().subscribe((r) => (result = r));
    http.expectOne('https://example.test/chefs.json').flush({ '1': { name: 'Remote Chef', cuisine: 'Thai', baseFee: 1, dailyRate: 2 } });
    expect(result?.source).toBe('remote');
    expect(result?.chefs[0].name).toBe('Remote Chef');
  });

  it('falls back to the local file when the remote endpoint fails', () => {
    environment.chefsUrl = 'https://example.test/chefs.json';
    let result: { source: string; remoteFailed: boolean } | undefined;
    service.load().subscribe((r) => (result = r));
    http.expectOne('https://example.test/chefs.json').flush('boom', { status: 500, statusText: 'Server Error' });
    http.expectOne('assets/data/chefs.json').flush(CHEFS);
    expect(result).toEqual(jasmine.objectContaining({ source: 'fallback', remoteFailed: true }));
  });

  it('falls back when the remote JSON contains no usable chefs', () => {
    environment.chefsUrl = 'https://example.test/chefs.json';
    let result: { source: string } | undefined;
    service.load().subscribe((r) => (result = r));
    http.expectOne('https://example.test/chefs.json').flush({ unexpected: 'shape' });
    http.expectOne('assets/data/chefs.json').flush(CHEFS);
    expect(result?.source).toBe('fallback');
  });
});
