export interface WeightCategory {
  id: string;
  weight: string;
}

export interface AgeCategory {
  id: string;
  age: string;
  weights: WeightCategory[];
}
