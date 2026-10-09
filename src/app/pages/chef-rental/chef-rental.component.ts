import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ChefCardComponent } from '../../components/chef-card/chef-card.component';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker.component';
import { Chef } from '../../models/chef';
import { DateRange } from '../../models/rental';
import { ChefService, filterChefs } from '../../services/chef.service';
import { RentalService, rentalErrorMessage } from '../../services/rental.service';
import { SearchService } from '../../services/search.service';
import { inclusiveDays, tomorrowIso } from '../../shared/iso-date';

export interface RentalNotice {
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: string;
}

@Component({
  selector: 'app-chef-rental',
  standalone: true,
  imports: [ChefCardComponent, DateRangePickerComponent],
  templateUrl: './chef-rental.component.html',
  styleUrl: './chef-rental.component.scss',
})
export class ChefRentalComponent implements OnInit {
  private readonly chefService = inject(ChefService);
  private readonly rentalService = inject(RentalService);
  readonly search = inject(SearchService);

  readonly minDate = tomorrowIso();

  readonly chefs = signal<Chef[]>([]);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly usedFallbackAfterError = signal(false);

  readonly selectedChef = signal<Chef | null>(null);
  readonly range = signal<DateRange>({ start: null, end: null });
  readonly submitting = signal(false);
  readonly notice = signal<RentalNotice | null>(null);

  /** The chef list filtered by the navbar search text (name or cuisine, case-insensitive). */
  readonly visibleChefs = computed(() => filterChefs(this.chefs(), this.search.term()));
  readonly searchText = computed(() => this.search.term().trim());

  readonly days = computed(() => {
    const { start, end } = this.range();
    return start && end ? inclusiveDays(start, end) : null;
  });

  /** Display-only estimate; the server calculates the real totalPrice. */
  readonly estimate = computed(() => {
    const chef = this.selectedChef();
    const days = this.days();
    return chef && days && days > 0 ? chef.baseFee + days * chef.dailyRate : null;
  });

  readonly canSubmit = computed(
    () => !!this.selectedChef() && !!this.range().start && !!this.range().end && !this.submitting(),
  );

  ngOnInit(): void {
    this.loadChefs();
  }

  loadChefs(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.chefService.load().subscribe({
      next: (result) => {
        this.chefs.set(result.chefs);
        this.usedFallbackAfterError.set(result.remoteFailed);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  selectChef(chef: Chef): void {
    this.selectedChef.set(chef);
    this.notice.set(null);
  }

  removeChef(): void {
    this.selectedChef.set(null);
  }

  onRangeChange(range: DateRange): void {
    this.range.set(range);
    this.notice.set(null);
  }

  submit(): void {
    const chef = this.selectedChef();
    const { start, end } = this.range();
    if (!chef || !start || !end || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.notice.set(null);
    this.rentalService.create(this.rentalService.buildRequest(chef, start, end)).subscribe({
      next: (rental) => {
        this.submitting.set(false);
        this.notice.set({
          type: 'success',
          title: 'Sikeres foglalás',
          message: 'Jó étvágyat kívánunk!',
          details: `${chef.name}, ${rental.startDate} – ${rental.endDate}, összesen ${rental.totalPrice} €`,
        });
        this.selectedChef.set(null);
        this.range.set({ start: null, end: null });
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.notice.set({ type: 'error', title: 'Sikertelen foglalás', message: rentalErrorMessage(error) });
      },
    });
  }

  clearSearch(): void {
    this.search.term.set('');
  }
}
