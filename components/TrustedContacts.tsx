
import React, { useState } from 'react';
import { TrustedContact } from '../types';

interface TrustedContactsProps {
  contacts: TrustedContact[];
  onAdd: (contact: TrustedContact) => void;
  onRemove: (id: string) => void;
}

const TrustedContacts: React.FC<TrustedContactsProps> = ({ contacts, onAdd, onRemove }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newContact,
      id: Math.random().toString(36).substr(2, 9)
    });
    setNewContact({ name: '', email: '', phone: '' });
    setIsAdding(false);
  };

  return (
    <div className="mt-12 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Trusted Contacts</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
        >
          {isAdding ? 'Cancel' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl animate-fade-in">
          <input
            type="text"
            required
            placeholder="Name"
            className="px-4 py-2 rounded-lg border border-gray-200 outline-none"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          <input
            type="email"
            required
            placeholder="Email"
            className="px-4 py-2 rounded-lg border border-gray-200 outline-none"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          />
          <input
            type="tel"
            required
            placeholder="Phone"
            className="px-4 py-2 rounded-lg border border-gray-200 outline-none"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          />
          <button type="submit" className="md:col-span-3 py-2 bg-indigo-600 text-white rounded-lg font-bold">Save Contact</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contacts.map((c) => (
          <div key={c.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-500">{c.email} • {c.phone}</p>
            </div>
            <button
              onClick={() => onRemove(c.id)}
              disabled={contacts.length <= 1}
              className="p-2 text-gray-300 hover:text-red-500 disabled:opacity-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedContacts;
