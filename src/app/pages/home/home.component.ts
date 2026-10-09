import { Component } from '@angular/core';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { InfoSectionComponent } from '../../components/info-section/info-section.component';
import { SECTIONS } from '../../content/site-content';

/** The original Gourmet Moments landing page. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSectionComponent, InfoSectionComponent],
  template: `
    <app-hero-section />
    @for (section of sections; track section.initial) {
      <app-info-section [content]="section" />
    }
  `,
})
export class HomeComponent {
  readonly sections = SECTIONS;
}
