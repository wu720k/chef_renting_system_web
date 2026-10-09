import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Chef } from '../../models/chef';
import { SearchService } from '../../services/search.service';
import { ChefRentalComponent } from './chef-rental.component';

const CHEFS: Chef[] = [
  { id: 1, name: 'Sophia Ricci', cuisine: 'Italian', description: 'd', image: '', baseFee: 245, dailyRate: 175 },
  { id: 2, name: 'David Keller', cuisine: 'French', description: 'd', image: '', baseFee: 270, dailyRate: 190 },
  { id: 3, name: 'Pamela Dawson', cuisine: 'American', description: 'd', image: '', baseFee: 275, dailyRate: 200 },
];
const RENTALS_URL = `${environment.apiBaseUrl}/berlesek`;

describe('ChefRentalComponent', () => {
  let fixture: ComponentFixture<ChefRentalComponent>;
  let component: ChefRentalComponent;
  let http: HttpTestingController;
  let el: HTMLElement;

  const names = () => Array.from(el.querySelectorAll('app-chef-card .card-title')).map((e) => e.textContent?.trim());
  const query = (testId: string) => el.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;

  function selectChefAndDates(): void {
    component.selectChef(CHEFS[0]);
    component.onRangeChange({ start: '2030-05-10', end: '2030-05-14' });
    fixture.detectChanges();
  }

  function loadChefs(): void {
    http.expectOne('assets/data/chefs.json').flush(CHEFS);
    fixture.detectChanges();
  }

  const originalChefsUrl = environment.chefsUrl;

  beforeEach(() => {
    // These tests drive the local fallback; remote loading is covered in chef.service.spec.ts.
    environment.chefsUrl = '';
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ChefRentalComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    environment.chefsUrl = originalChefsUrl;
    http.verify();
  });

  describe('chef data loading', () => {
    it('shows a loading state, then the chef cards', () => {
      expect(query('loading')).toBeTruthy();
      loadChefs();
      expect(query('loading')).toBeNull();
      expect(names()).toEqual(['Sophia Ricci', 'David Keller', 'Pamela Dawson']);
    });

    it('shows an error with a retry button when the chefs cannot be loaded', () => {
      http.expectOne('assets/data/chefs.json').flush('x', { status: 404, statusText: 'Not Found' });
      fixture.detectChanges();
      expect(query('load-error')).toBeTruthy();
      (query('load-error')!.querySelector('button') as HTMLButtonElement).click();
      loadChefs();
      expect(names().length).toBe(3);
    });
  });

  describe('search', () => {
    beforeEach(() => loadChefs());

    const search = (term: string) => {
      TestBed.inject(SearchService).term.set(term);
      fixture.detectChanges();
    };

    it('filters by chef name', () => {
      search('keller');
      expect(names()).toEqual(['David Keller']);
    });

    it('filters by cuisine', () => {
      search('italian');
      expect(names()).toEqual(['Sophia Ricci']);
    });

    it('is case-insensitive and ignores surrounding whitespace', () => {
      search('  FrEnCh ');
      expect(names()).toEqual(['David Keller']);
    });

    it('shows everything again when the search is cleared', () => {
      search('keller');
      search('');
      expect(names().length).toBe(3);
    });

    it('shows an empty state when nothing matches', () => {
      search('sushi');
      expect(query('empty-state')?.textContent).toContain('Nincs találat');
      expect(names()).toEqual([]);
    });
  });

  describe('renting', () => {
    beforeEach(() => loadChefs());

    it('keeps the submit button disabled until a chef and a period are selected', () => {
      const submit = query('submit') as HTMLButtonElement;
      expect(submit.disabled).toBeTrue();
      component.selectChef(CHEFS[0]);
      fixture.detectChanges();
      expect(submit.disabled).toBeTrue();
      component.onRangeChange({ start: '2030-05-10', end: '2030-05-14' });
      fixture.detectChanges();
      expect(submit.disabled).toBeFalse();
    });

    it('shows the selected chef and an estimated total', () => {
      selectChefAndDates();
      expect(query('selected-chef')?.textContent).toContain('Sophia Ricci');
      expect(query('selected-chef')?.textContent).toContain(`${245 + 5 * 175} €`);
    });

    it('sends a request built from the selected chef and dates (no totalPrice)', () => {
      selectChefAndDates();
      component.submit();
      const req = http.expectOne(RENTALS_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        uid: 101,
        chefId: 1,
        startDate: '2030-05-10',
        endDate: '2030-05-14',
        dailyRate: 175,
        baseFee: 245,
      });
      req.flush({ id: 9, ...req.request.body, totalPrice: 1120 }, { status: 201, statusText: 'Created' });
    });

    it('shows a success message after a successful rental and resets the selection', () => {
      selectChefAndDates();
      component.submit();
      http.expectOne(RENTALS_URL).flush(
        { id: 9, uid: 101, chefId: 1, startDate: '2030-05-10', endDate: '2030-05-14', dailyRate: 175, baseFee: 245, totalPrice: 1120 },
        { status: 201, statusText: 'Created' },
      );
      fixture.detectChanges();
      const notice = query('rental-notice')!;
      expect(notice.classList).toContain('alert-success');
      expect(notice.textContent).toContain('Sikeres foglalás');
      expect(notice.textContent).toContain('1120 €');
      expect(component.selectedChef()).toBeNull();
      expect(component.submitting()).toBeFalse();
    });

    it('shows the backend validation message when the rental is rejected', () => {
      selectChefAndDates();
      component.submit();
      http.expectOne(RENTALS_URL).flush(
        { status: 400, message: 'A séf (chefId: 1) a megadott időszakban már foglalt: a bérlések nem fedhetik át egymást.' },
        { status: 400, statusText: 'Bad Request' },
      );
      fixture.detectChanges();
      const notice = query('rental-notice')!;
      expect(notice.classList).toContain('alert-danger');
      expect(notice.textContent).toContain('Sikertelen foglalás');
      expect(notice.textContent).toContain('már foglalt');
      expect(component.selectedChef()?.id).toBe(1); // selection is kept so the user can adjust the dates
    });

    it('explains that the backend is unreachable without technical details', () => {
      selectChefAndDates();
      component.submit();
      http.expectOne(RENTALS_URL).error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
      fixture.detectChanges();
      const text = query('rental-notice')!.textContent!;
      expect(text).toContain('nem érhető el');
      expect(text).not.toContain('HttpErrorResponse');
    });

    it('prevents repeated submissions while a request is in progress', () => {
      selectChefAndDates();
      component.submit();
      fixture.detectChanges();
      expect((query('submit') as HTMLButtonElement).disabled).toBeTrue();
      component.submit();
      component.submit();
      const pending = http.match(RENTALS_URL);
      expect(pending.length).toBe(1);
      pending[0].flush({ message: 'x' }, { status: 500, statusText: 'x' });
    });
  });
});
