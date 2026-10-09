/** A chef available for rent. */
export interface Chef {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  /** Image path or URL; empty when the source has no picture (a local placeholder is shown). */
  image: string;
  /** Base fee in euros ("Alap Díj"). */
  baseFee: number;
  /** Daily rate in euros ("Napi díj"). */
  dailyRate: number;
}

export interface ChefLoadResult {
  chefs: Chef[];
  /** Where the list came from. */
  source: 'remote' | 'fallback';
  /** True when a remote URL is configured but could not be used (so the fallback was loaded). */
  remoteFailed: boolean;
}
