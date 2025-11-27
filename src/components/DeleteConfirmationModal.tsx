import { AlertTriangle, X } from 'lucide-react';
import { AppSettings } from '../App';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
  itemName?: string;
  settings: AppSettings;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    deleteConfirmation: 'Delete Confirmation',
    areYouSure: 'Are you sure you want to delete this',
    thisAction: 'This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    customer: 'customer',
    credit: 'credit',
    staff: 'staff member',
  },
  am: {
    deleteConfirmation: 'መሰረዝ ማረጋገጫ',
    areYouSure: 'እርግጠኛ ነዎት ይህን መሰረዝ ይፈልጋሉ',
    thisAction: 'ይህ ተግባር መልሰው ማስመለስ አይቻልም።',
    cancel: 'ሰርዝ',
    delete: 'ሰርዝ',
    customer: 'ደንበኛ',
    credit: 'ብድር',
    staff: 'ሰራተኛ',
  },
};

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
  settings,
}: DeleteConfirmationModalProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-gray-900 dark:text-white">{t('deleteConfirmation')}</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {t('areYouSure')} {t(itemType)}
              {itemName && <span className="font-semibold"> "{itemName}"</span>}?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('thisAction')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
