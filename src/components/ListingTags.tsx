import { Megaphone, ShieldCheck } from 'lucide-react';
import { useApp } from '../store';
import { isFeatured, isVerified } from '../lib/revenue';
import type { Supply } from '../types';

/**
 * "Verified grade" and "Promoted" labels for a listing. Groups pass promoted={false}: a promotion
 * only changes Market placement, so labelling it next to a group's best match would read as paid ranking.
 */
export default function ListingTags({ supply, promoted = true }: { supply: Supply; promoted?: boolean }) {
  const { t } = useApp();
  return (
    <>
      {isVerified(supply) && (
        <span className="tag verified" title={t('verified_tip')}>
          <ShieldCheck size={14} aria-hidden /> {t('verified')}
        </span>
      )}
      {promoted && isFeatured(supply) && (
        <span className="tag promoted" title={t('promoted_tip')}>
          <Megaphone size={14} aria-hidden /> {t('promoted')}
        </span>
      )}
    </>
  );
}
