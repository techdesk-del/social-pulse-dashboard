'use client';

import type { TabId } from '../lib/types';
import { COLORS } from '../lib/constants';

interface TabDef {
  id: TabId;
  label: string;
  accent: string;
}

const TAB_DEFS: TabDef[] = [
  { id: 'overview', label: 'Overview', accent: COLORS.text },
  { id: 'linkedin', label: 'LinkedIn', accent: COLORS.li },
  { id: 'instagram', label: 'Instagram', accent: COLORS.ig },
  { id: 'facebook', label: 'Facebook', accent: COLORS.fb },
  { id: 'google', label: 'Google Reviews', accent: COLORS.goog },
  { id: 'compare', label: 'Compare Weeks', accent: COLORS.flat },
];

interface Props {
  activeTab: TabId;
  onSelectTab: (id: TabId) => void;
}

export default function Tabs({ activeTab, onSelectTab }: Props) {
  return (
    <div className="tabs">
      {TAB_DEFS.map((t) => (
        <button
          key={t.id}
          id={`tab-${t.id}`}
          className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onSelectTab(t.id)}
        >
          <span
            className="tab-icon"
            style={{ background: activeTab === t.id ? t.accent : 'var(--text-faint)' }}
          />
          {t.label}
        </button>
      ))}
    </div>
  );
}

export { TAB_DEFS };
