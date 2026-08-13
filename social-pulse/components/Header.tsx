'use client';

import { formatWeekLabel } from '../lib/utils';
import type { WeekEntry } from '../lib/types';
import type { Session } from '../lib/auth';

interface Props {
  activeWeek: WeekEntry;
  session: Session;
  onImport: () => void;
  onExportPdf: () => void;
  onAdd: () => void;
  onLogout: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pdfLoading?: boolean;
}

export default function Header({
  activeWeek,
  session,
  onImport,
  onExportPdf,
  onAdd,
  onLogout,
  fileInputRef,
  onFileChange,
  pdfLoading,
}: Props) {
  return (
    <div className="header-row">
      <div>
        <div className="eyebrow">WEEKLY PERFORMANCE DASHBOARD</div>
        <div className="title">
          Social Pulse{' '}
          <span className="week-range">{formatWeekLabel(activeWeek.weekId)}</span>
        </div>
      </div>

      <div className="header-actions">
        {/* User avatar + name + logout */}
        <div className="header-user">
          <div className="header-avatar">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <span className="header-username">{session.name}</span>
          <button className="btn btn-logout" onClick={onLogout} id="btn-logout" title="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>

        <div className="header-divider" />

        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onFileChange}
          id="import-file-input"
        />
        <button className="btn" onClick={onImport} id="btn-import">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>

        <button className="btn btn-pdf" onClick={onExportPdf} disabled={pdfLoading} id="btn-export-pdf">
          {pdfLoading ? (
            <span className="spin" style={{ fontSize: 13 }}>⟳</span>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          )}
          Export PDF
        </button>

        <button className="btn btn-primary" onClick={onAdd} id="btn-add-week">
          + Add / Edit Week
        </button>
      </div>
    </div>
  );
}
