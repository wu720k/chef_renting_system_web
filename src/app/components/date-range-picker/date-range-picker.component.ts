import { Component, computed, input, model, signal } from '@angular/core';
import { DateRange } from '../../models/rental';
import { daysInMonth, toIso, weekdayMondayFirst } from '../../shared/iso-date';

interface DayCell {
  iso: string;
  day: number;
  disabled: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
}

const MONTHS = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
const WEEKDAYS = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];

/** Inline calendar for choosing a first and a last day. Days before minDate cannot be selected. */
@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
})
export class DateRangePickerComponent {
  /** Earliest selectable day (yyyy-MM-dd). */
  readonly minDate = input.required<string>();
  readonly range = model<DateRange>({ start: null, end: null });

  readonly months = MONTHS;
  readonly weekdays = WEEKDAYS;

  private readonly viewYear = signal<number | null>(null);
  private readonly viewMonth = signal<number | null>(null);
  private readonly hover = signal<string | null>(null);

  readonly year = computed(() => this.viewYear() ?? Number(this.minDate().slice(0, 4)));
  readonly month = computed(() => this.viewMonth() ?? Number(this.minDate().slice(5, 7)));

  readonly years = computed(() => {
    const first = Number(this.minDate().slice(0, 4));
    return [first, first + 1, first + 2, first + 3];
  });

  readonly canGoBack = computed(() => toIso(this.year(), this.month(), 1) > this.minDate().slice(0, 8) + '01');

  /** Leading empty cells so that day 1 sits under the right weekday (Monday first). */
  readonly blanks = computed(() => Array.from({ length: weekdayMondayFirst(this.year(), this.month(), 1) }));

  readonly cells = computed<DayCell[]>(() => {
    const { start, end } = this.range();
    const previewEnd = end ?? (start && this.hover() && this.hover()! >= start ? this.hover() : null);
    const min = this.minDate();
    return Array.from({ length: daysInMonth(this.year(), this.month()) }, (_, i) => {
      const iso = toIso(this.year(), this.month(), i + 1);
      return {
        iso,
        day: i + 1,
        disabled: iso < min,
        isStart: iso === start,
        isEnd: iso === end,
        inRange: !!start && !!previewEnd && iso > start && iso < previewEnd,
      };
    });
  });

  select(cell: DayCell): void {
    if (cell.disabled) {
      return;
    }
    const { start, end } = this.range();
    if (!start || end || cell.iso < start) {
      this.range.set({ start: cell.iso, end: null });
    } else {
      this.range.set({ start, end: cell.iso });
    }
    this.hover.set(null);
  }

  onHover(cell: DayCell | null): void {
    this.hover.set(cell && !cell.disabled ? cell.iso : null);
  }

  previousMonth(): void {
    this.shiftMonth(-1);
  }

  nextMonth(): void {
    this.shiftMonth(1);
  }

  setMonth(value: string): void {
    this.viewMonth.set(Number(value));
    this.viewYear.set(this.year());
  }

  setYear(value: string): void {
    this.viewYear.set(Number(value));
    this.viewMonth.set(this.month());
  }

  private shiftMonth(delta: number): void {
    const index = this.year() * 12 + (this.month() - 1) + delta;
    this.viewYear.set(Math.floor(index / 12));
    this.viewMonth.set((index % 12) + 1);
  }
}
