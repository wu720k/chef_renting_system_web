import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';

describe('DateRangePickerComponent', () => {
  let fixture: ComponentFixture<DateRangePickerComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangePickerComponent);
    fixture.componentRef.setInput('minDate', '2030-05-10');
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const day = (iso: string) => el.querySelector(`[data-date="${iso}"]`) as HTMLButtonElement;

  it('disables days before the minimum date', () => {
    expect(day('2030-05-09').disabled).toBeTrue();
    expect(day('2030-05-10').disabled).toBeFalse();
  });

  it('selects a start and an end day and highlights the days between', () => {
    day('2030-05-12').click();
    fixture.detectChanges();
    day('2030-05-15').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.range()).toEqual({ start: '2030-05-12', end: '2030-05-15' });
    expect(day('2030-05-13').classList).toContain('in-range');
    expect(day('2030-05-12').classList).toContain('start');
    expect(day('2030-05-15').classList).toContain('end');
  });

  it('starts a new range on the third click or when an earlier day is clicked', () => {
    day('2030-05-12').click();
    day('2030-05-15').click();
    day('2030-05-20').click();
    expect(fixture.componentInstance.range()).toEqual({ start: '2030-05-20', end: null });
    day('2030-05-11').click();
    expect(fixture.componentInstance.range()).toEqual({ start: '2030-05-11', end: null });
  });
});
