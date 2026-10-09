import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BRAND_NAME, NAV_LINKS } from '../../content/site-content';
import { SearchService } from '../../services/search.service';

const CHEF_LIST_PATH = '/seferek';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly searchService = inject(SearchService);

  readonly brand = BRAND_NAME;
  readonly links = NAV_LINKS;

  /** Whether the collapsible menu is open (only relevant below 992px). */
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Live search: every keystroke updates the shared term; typing elsewhere opens the chef list. */
  onSearchInput(value: string): void {
    this.searchService.term.set(value);
    if (value.trim()) {
      this.showChefList();
    }
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.showChefList();
    this.closeMenu();
  }

  private showChefList(): void {
    if (!this.router.url.startsWith(CHEF_LIST_PATH)) {
      void this.router.navigateByUrl(CHEF_LIST_PATH);
    }
  }
}
