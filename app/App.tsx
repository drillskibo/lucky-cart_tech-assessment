import { useMemo, useState } from 'react';
import { EligibilityService } from '../src/eligibility.service';
import type { Cart, Criteria } from '../src/types';
import { loadDefaultCart, loadDefaultCriteria } from './fixtures';

import { CartPanel } from '@/components/cart/cart-panel';
import { CriteriaPanel } from '@/components/criteria/criteria-panel';
import { Logo } from '@/components/shared/logo';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const service = new EligibilityService();

export default function App() {
  const [cart, setCart] = useState<Cart>(() => loadDefaultCart());
  const [criteria, setCriteria] = useState<Criteria>(() => loadDefaultCriteria());
  const isEligible = useMemo(() => service.isEligible(cart, criteria), [cart, criteria]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Card className="mb-6">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-8 md:gap-3 md:flex-row md:items-center">
            <Logo className="h-8 w-auto shrink-0 text-foreground md:h-9" />
            <CardTitle className="text-3xl">Eligibility Checker</CardTitle>
          </div>
          <div>
            <Badge
              variant={isEligible ? 'success' : 'destructive'}
              className="px-4 py-1.5 text-sm"
              data-testid="eligibility-result"
            >
              {isEligible ? 'Eligible' : 'Not eligible'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 md:grid-cols-2">
        <CartPanel value={cart} onChange={setCart} />
        <CriteriaPanel value={criteria} onChange={setCriteria} />
      </section>
    </main>
  );
}
