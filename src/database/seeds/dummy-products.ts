export interface DummyProductSeed {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
}

export const DUMMY_PRODUCTS: DummyProductSeed[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Wireless Headphones',
    description: 'Over-ear noise-cancelling headphones with 30h battery life.',
    priceInCents: 259_900,
    stock: 15,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Mechanical Keyboard',
    description: '75% layout hot-swappable mechanical keyboard.',
    priceInCents: 349_900,
    stock: 10,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Smart Watch',
    description: 'Fitness tracking smart watch with heart-rate monitor.',
    priceInCents: 599_900,
    stock: 8,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Portable Speaker',
    description: 'Waterproof bluetooth speaker with 12h playtime.',
    priceInCents: 149_900,
    stock: 20,
  },
];
