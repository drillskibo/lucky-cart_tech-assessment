import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {action}
        </div>
        {headerAction ? <div className="self-start sm:self-auto">{headerAction}</div> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
