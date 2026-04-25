import { startTransition, type ReactNode, useEffect, useRef, useState } from 'react';

import { JsonPanel } from '@/components/shared/json-panel';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';

type EditorPanelProps<T> = {
  title: string;
  value: T;
  onChange: (value: T) => void;
  editor: ReactNode;
  className?: string;
  contentClassName?: string;
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function EditorPanel<T>({
  title,
  value,
  onChange,
  editor,
  className,
  contentClassName,
}: EditorPanelProps<T>) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawValue, setRawValue] = useState(() => formatJson(value));
  const [rawError, setRawError] = useState<string | null>(null);
  const lastChangeCameFromRawEditor = useRef(false);

  useEffect(() => {
    if (lastChangeCameFromRawEditor.current) {
      lastChangeCameFromRawEditor.current = false;
      return;
    }

    setRawValue(formatJson(value));
    setRawError(null);
  }, [value]);

  function handleToggleRawJson() {
    setRawValue(formatJson(value));
    setRawError(null);
    setShowRawJson((current) => !current);
  }

  function handleRawValueChange(nextValue: string) {
    setRawValue(nextValue);

    try {
      const parsedValue = JSON.parse(nextValue) as unknown;

      if (!isJsonObject(parsedValue)) {
        setRawError('JSON must describe an object.');
        return;
      }

      lastChangeCameFromRawEditor.current = true;
      setRawError(null);
      startTransition(() => {
        onChange(parsedValue as T);
      });
    } catch {
      setRawError('JSON is invalid.');
    }
  }

  const resolvedContentClassName = showRawJson ? 'flex min-h-0 flex-col' : contentClassName;

  return (
    <Panel
      title={title}
      action={
        <Button variant="outline" size="sm" onClick={handleToggleRawJson}>
          {showRawJson ? 'Editor' : 'Raw JSON'}
        </Button>
      }
      className={className}
      contentClassName={resolvedContentClassName}
    >
      {showRawJson ? (
        <JsonPanel
          title={title}
          value={rawValue}
          error={rawError}
          onChange={handleRawValueChange}
        />
      ) : (
        editor
      )}
    </Panel>
  );
}
