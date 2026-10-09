import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders the navbar and the home page (hero + both info sections) at "/"', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('nav.navbar')).toBeTruthy();
    expect(el.querySelector('h1')?.textContent).toContain('Gourmet Moments');
    expect(el.querySelectorAll('app-info-section').length).toBe(2);
    expect(el.querySelectorAll('img').length).toBe(3);
  });

  it('toggles the hamburger menu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const collapse = el.querySelector('#mainNavigation') as HTMLElement;
    expect(collapse.classList.contains('show')).toBeFalse();
    (el.querySelector('.navbar-toggler') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(collapse.classList.contains('show')).toBeTrue();
  });

  it('typing in the navbar search opens the chef list', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type=search]') as HTMLInputElement;
    input.value = 'french';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/seferek');
    TestBed.inject(HttpTestingController).match(() => true).forEach((r) => r.flush([]));
  });
});
