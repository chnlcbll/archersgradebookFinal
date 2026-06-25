export type Component = {
  id: string;
  label: string;
  score: string;
  total: string;
};

export type Criterion = {
  id: string;
  name: string;
  weight: number;
  components: Component[];
};

export type Subject = {
  id: string;
  name: string;
  scale: 'standard' | 'strict' | 'dlsu';
  lockedWeights: boolean;
  criteria: Criterion[];
  passingPercentage: number;
};
