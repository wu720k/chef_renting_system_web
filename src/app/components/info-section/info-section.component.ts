import { Component, input } from '@angular/core';
import { InfoSectionContent } from '../../content/site-content';

/** Text block with a large green initial next to an image; below 768px text comes first, then the image. */
@Component({
  selector: 'app-info-section',
  standalone: true,
  templateUrl: './info-section.component.html',
  styleUrl: './info-section.component.scss',
})
export class InfoSectionComponent {
  readonly content = input.required<InfoSectionContent>();
}
