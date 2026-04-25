import { Textarea } from '@/components/ui/textarea';

import type { ComponentProps, RefObject } from 'react';

type JsonPanelProps = {
  title: string;
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: ComponentProps<'textarea'>['onKeyDown'];
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
};

export function JsonPanel({
  title,
  value,
  error,
  onChange,
  onBlur,
  onKeyDown,
  textareaRef,
}: JsonPanelProps) {
  const descriptionId = `${title.toLowerCase()}-json-help`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="h-full min-h-72 flex-1 font-mono text-xs leading-6"
        aria-label={`${title} JSON editor`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={descriptionId}
        spellCheck={false}
      />
      <div
        id={descriptionId}
        className={error ? 'text-xs text-destructive sm:text-sm' : 'text-xs text-muted-foreground sm:text-sm'}
      >
        {error ?? 'Changes apply as soon as the JSON is valid.'}
      </div>
    </div>
  );
}
