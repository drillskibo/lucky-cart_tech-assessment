type JsonPanelProps = {
  value: unknown;
};

export function JsonPanel({ value }: JsonPanelProps) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-6 text-foreground">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
