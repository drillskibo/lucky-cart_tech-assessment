import { CriteriaEditor } from '@/components/criteria/criteria-editor';
import { getUniqueKey } from '@/components/editor-controls';
import { EditorPanel } from '@/components/shared/editor-panel';

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
      editor={<CriteriaEditor value={value} onChange={onChange} onAddCriteria={handleAddCriteria} />}
      className="h-full"
      contentClassName="space-y-4"
    />
  );
}
