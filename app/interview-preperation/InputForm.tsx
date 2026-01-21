'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface InputFormProps {
  onSubmit?: (data: {
    skills: string[];
    role: string;
    company: string;
    experience: string;
  }) => void;
}

// ...existing code...
export default function InputForm({ onSubmit = () => {} }: InputFormProps) {
    const [formData, setFormData] = useState({
      skills: 'JavaScript, React, Node.js',
      role: 'Frontend Developer',
      company: 'Google',
      experience: '3',
    });
  // ...existing code...

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      role: formData.role,
      company: formData.company,
      experience: formData.experience,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-neutral-300">
              Required Skills
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="skills"
                id="skills"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. JavaScript, React, Node.js"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-neutral-300">
              Desired Role
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="role"
                id="role"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Frontend Developer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-neutral-300">
              Company Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="company"
                id="company"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-neutral-300">
              Years of Experience
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="experience"
                id="experience"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 3"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}