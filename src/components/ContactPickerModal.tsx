import { useState, useEffect } from 'react';
import { X, Search, User, Phone, AlertCircle } from 'lucide-react';

interface Contact {
  name: string;
  phone: string[];
}

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (name: string, phone: string) => void;
}

export function ContactPickerModal({ isOpen, onClose, onSelectContact }: ContactPickerModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    } else {
      setContacts([]);
      setFilteredContacts([]);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      setFilteredContacts(
        contacts.filter(contact =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.phone.some(phone => phone.includes(searchTerm))
        )
      );
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if Contacts API is available (Contact Picker API)
      if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
        try {
          // Use Contact Picker API (Chrome/Edge on Android)
          const contacts = await (navigator as any).contacts.select(
            ['name', 'tel'],
            { multiple: true }
          );
          
          const formattedContacts: Contact[] = contacts.map((contact: any) => ({
            name: contact.name?.[0] || 'Unknown',
            phone: Array.isArray(contact.tel) ? contact.tel : contact.tel ? [contact.tel] : [],
          }));
          
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
          setLoading(false);
          return;
        } catch (selectError: any) {
          console.log('Contact select error:', selectError);
        }
      }

      // Check for alternative Contacts API
      if ('contacts' in navigator && 'getProperties' in (navigator as any).contacts) {
        try {
          const contacts = await (navigator as any).contacts.getProperties(['name', 'tel']);
          const formattedContacts: Contact[] = contacts.map((contact: any) => ({
            name: contact.name?.[0] || 'Unknown',
            phone: Array.isArray(contact.tel) ? contact.tel : contact.tel ? [contact.tel] : [],
          }));
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
          setLoading(false);
          return;
        } catch (getError: any) {
          console.log('Contact get error:', getError);
        }
      }

      // For Telegram Mini Apps, we might have access to Telegram's contact picker
      if (window.Telegram?.WebApp?.openContact) {
        try {
          window.Telegram.WebApp.openContact((contact: any) => {
            if (contact) {
              const formattedContact: Contact = {
                name: contact.first_name + (contact.last_name ? ' ' + contact.last_name : '') || 'Unknown',
                phone: contact.phone_number ? [contact.phone_number] : [],
              };
              handleSelectContact(formattedContact);
            }
          });
          setLoading(false);
          return;
        } catch (tgError: any) {
          console.log('Telegram contact error:', tgError);
        }
      }

      // Fallback message
      throw new Error(
        'Contact picker is not available in this browser. ' +
        'Please enter contact details manually or use a mobile device with contact permissions.'
      );
    } catch (err: any) {
      console.error('Error loading contacts:', err);
      setError(
        err.message || 
        'Unable to access contacts. This feature requires browser permissions and may not be available on all devices. Please enter contact details manually.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    // Use the first phone number, or let user choose if multiple
    if (contact.phone.length === 0) {
      setError('This contact has no phone number');
      return;
    }

    const phone = contact.phone[0];
    onSelectContact(contact.name, phone);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Select Contact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose a contact from your phone
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white mb-2">Unable to Load Contacts</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={loadContacts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No contacts found' : 'No contacts available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectContact(contact)}
                  className="w-full text-left p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">{contact.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {contact.phone.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

