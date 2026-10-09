import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Chef } from '../models/chef';
import { RentalService, rentalErrorMessage } from './rental.service';

const CHEF: Chef = { id: 42, name: 'Sophia Ricci', cuisine: 'Italian', description: '', image: '', baseFee: 245, dailyRate: 175 };

describe('RentalService', () => {
  let service: RentalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RentalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('builds the request from the chef, the fixed user id and the dates, without totalPrice', () => {
    const request = service.buildRequest(CHEF, '2030-05-10', '2030-05-14');
    expect(request).toEqual({
      uid: 101,
      chefId: 42,
      startDate: '2030-05-10',
      endDate: '2030-05-14',
      dailyRate: 175,
      baseFee: 245,
    });
    expect('totalPrice' in request).toBeFalse();
    expect('id' in request).toBeFalse();
  });

  it('POSTs the request to {apiBaseUrl}/berlesek', () => {
    const request = service.buildRequest(CHEF, '2030-05-10', '2030-05-14');
    service.create(request).subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/berlesek`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ ...request, id: 1, totalPrice: 1120 }, { status: 201, statusText: 'Created' });
  });
});

describe('rentalErrorMessage', () => {
  const httpError = (status: number, body: unknown) => new HttpErrorResponse({ status, error: body });

  it('uses the backend message for validation errors', () => {
    expect(rentalErrorMessage(httpError(400, { status: 400, message: 'A séf már foglalt.' }))).toBe('A séf már foglalt.');
  });

  it('explains that the server cannot be reached', () => {
    expect(rentalErrorMessage(httpError(0, null))).toContain('nem érhető el');
  });

  it('treats a gateway/proxy error without an API body as an unreachable server', () => {
    expect(rentalErrorMessage(httpError(504, ''))).toContain('nem érhető el');
    expect(rentalErrorMessage(httpError(500, null))).toContain('nem érhető el');
  });

  it('hides technical details for server errors and unknown shapes', () => {
    expect(rentalErrorMessage(httpError(500, '<html>stack trace</html>'))).not.toContain('stack');
    expect(rentalErrorMessage(new Error('boom'))).not.toContain('boom');
  });
});
