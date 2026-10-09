import { Component, input, output } from '@angular/core';
import { Chef } from '../../models/chef';

@Component({
  selector: 'app-chef-card',
  standalone: true,
  templateUrl: './chef-card.component.html',
  styleUrl: './chef-card.component.scss',
})
export class ChefCardComponent {
  readonly chef = input.required<Chef>();
  readonly selected = input(false);
  readonly book = output<Chef>();

  readonly placeholder = 'assets/images/chefs/placeholder.svg';

  /** Falls back to the local placeholder when an image is missing or cannot be loaded. */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(this.placeholder)) {
      img.src = this.placeholder;
    }
  }
}
