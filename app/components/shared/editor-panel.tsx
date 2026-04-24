import { useState, type ReactNode } from 'react';
import { JsonPanel } from '@/components/shared/json-panel';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';

type EditorPanelProps<T> = {
  title: string;
  value: T;
  editor: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function EditorPanel<T>({
  title,
  value,
  editor,
  className,
  contentClassName,
}: EditorPanelProps<T>) {
  const [showRawJson, setShowRawJson] = useState(false);

  return (
    <Panel
      title={title}
      action={
        <Button variant="outline" size="sm" onClick={() => setShowRawJson((current) => !current)}>
          {showRawJson ? 'Editor' : 'Raw JSON'}
        </Button>
      }
      className={className}
      contentClassName={contentClassName}
    >
      {showRawJson ? <JsonPanel value={value} /> : editor}
    </Panel>
  );
}
