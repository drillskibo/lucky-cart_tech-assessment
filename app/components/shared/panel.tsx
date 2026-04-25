import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';


type PanelProps = {
  title: string;
  action?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Panel({
  title,
  action,
  headerAction,
  children,
  className,
  contentClassName,
}: PanelProps) {
  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {action}
        </div>
        {headerAction ? <div className="self-start sm:self-auto">{headerAction}</div> : null}
      </CardHeader>
      <CardContent className={cn('min-h-0 flex-1', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
