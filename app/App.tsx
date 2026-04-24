import { useMemo, useState } from 'react';
import { EligibilityService } from '../src/eligibility.service';
import type { Cart, Criteria } from '../src/types';
import { loadDefaultCart, loadDefaultCriteria } from './fixtures';

const service = new EligibilityService();

export default function App() {
  const [cart] = useState<Cart>(() => loadDefaultCart());
  const [criteria] = useState<Criteria>(() => loadDefaultCriteria());
  const isEligible = useMemo(() => service.isEligible(cart, criteria), [cart, criteria]);

  return (
    <main className="container mx-auto py-8">
      <header className="pb-4">
        <p>Lucky Cart</p>
        <h1>Answer GUI</h1>
        <p>Eligibility: {String(isEligible)}</p>
      </header>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p>Cart</p>
          <pre>{JSON.stringify(cart, null, 2)}</pre>
        </div>
        <div>
          <p>Criteria</p>
          <pre>{JSON.stringify(criteria, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
