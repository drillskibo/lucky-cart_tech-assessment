import { Textarea } from '@/components/ui/textarea';

type JsonPanelProps = {
  title: string;
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function JsonPanel({ title, value, error, onChange, onBlur }: JsonPanelProps) {
  const descriptionId = `${title.toLowerCase()}-json-help`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
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
