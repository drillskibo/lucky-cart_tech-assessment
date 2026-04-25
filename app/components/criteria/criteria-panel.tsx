import { CriteriaEditor } from '@/components/criteria/criteria-editor';
import { getUniqueKey } from '@/components/editor-controls';
import { EditorPanel } from '@/components/shared/editor-panel';
import { Button } from '@/components/ui/button';
import { loadDefaultCriteria } from '@/fixtures';

import type { Criteria } from '@src/types';

type CriteriaPanelProps = {
  value: Criteria;
  onChange: (value: Criteria) => void;
};

export function CriteriaPanel({ value, onChange }: CriteriaPanelProps) {
  function handleAddCriteria() {
    const nextKey = getUniqueKey(value, 'field');
    onChange({
      ...value,
      [nextKey]: '',
    });
  }

  return (
    <EditorPanel
      title="Criteria"
      value={value}
      onChange={onChange}
      editor={<CriteriaEditor value={value} onChange={onChange} />}
      headerAction={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onChange(loadDefaultCriteria())}>
            Reset criteria
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddCriteria}>
            Add criteria
          </Button>
        </div>
      }
      className="h-full"
      contentClassName="space-y-4"
    />
  );
}
