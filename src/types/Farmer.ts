export interface FarmerMilkTypes {
  cow: boolean;
  buffalo: boolean;
}

export interface Farmer {
  id: string;
  dairyId: string;
  name: string;
  mobile: string;
  address?: string;
  milkTypes: FarmerMilkTypes;
  active: boolean;
  createdAt?: any;
}