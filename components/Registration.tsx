
import React, { useState } from 'react';
import { UserProfile, TrustedContact } from '../types';

interface RegistrationProps {
  onRegister: (profile: UserProfile) => void;
}

// Added local interface to handle form state separate from the final UserProfile structure
interface RegistrationFormData {
  name: string;
  email: string;
  headName: string;
  headEmail: string;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  // Use the local interface instead of UserProfile for internal state tracking to avoid type errors
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    headName: '',
    headEmail: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.headEmail) {
      // Map the registration form data to the required UserProfile and TrustedContact structure
      const initialContact: TrustedContact = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.headName,
        email: formData.headEmail,
        phone: '' // Required field from TrustedContact interface
      };

      const profile: UserProfile = {
        name: formData.name,
        gender: 'Other', // Required field by UserProfile interface
        age: 20,         // Required field by UserProfile interface
        contacts: [initialContact]
      };

      onRegister(profile);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Welcome</h2>
        <p className="text-gray-500 mt-2 text-sm">Please register to ensure your family can be notified in case of emergencies.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Jane Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jane@example.com"
          />
        </div>

        <hr className="my-6 border-gray-100" />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Family Head Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.headName}
            onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
            placeholder="Dad / Mom / Guardian"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Family Head Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.headEmail}
            onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })}
            placeholder="head@example.com"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
        >
          Start My Journey
        </button>
      </form>
    </div>
  );
};

export default Registration;
