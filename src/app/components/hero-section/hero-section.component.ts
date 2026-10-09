import { Component } from '@angular/core';
import { HERO } from '../../content/site-content';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  readonly hero = HERO;
}
