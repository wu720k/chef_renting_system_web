/** Body of POST /api/berlesek. No id and no totalPrice: the server generates / calculates them. */
export interface RentalRequest {
  uid: number;
  chefId: number;
  /** yyyy-MM-dd */
  startDate: string;
  /** yyyy-MM-dd */
  endDate: string;
  dailyRate: number;
  baseFee: number;
}

/** Rental as returned by the API. */
export interface Rental extends RentalRequest {
  id: number;
  totalPrice: number;
}

export interface DateRange {
  /** yyyy-MM-dd or null */
  start: string | null;
  end: string | null;
}
