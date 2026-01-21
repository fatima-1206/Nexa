'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface InputFormProps {
  onSubmit?: (data: {
    companyName: string;
    role: string;
    missingSkills: string[];
    roleSeniority: string;
    techStack: string[];
    interviewType: string;
  }) => void;
}

export default function InputForm({ onSubmit = () => {} }: InputFormProps) {
  const [formData, setFormData] = useState({
    companyName: 'Google',
    role: 'Frontend Developer',
    missingSkills: 'System Design, Distributed Systems',
    roleSeniority: 'Mid',
    techStack: 'JavaScript, React, Node.js',
    interviewType: 'Technical',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      companyName: formData.companyName,
      role: formData.role,
      missingSkills: formData.missingSkills.split(',').map(s => s.trim()).filter(s => s),
      roleSeniority: formData.roleSeniority,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s),
      interviewType: formData.interviewType,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-neutral-300">
              Company Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="companyName"
                id="companyName"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Google"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-neutral-300">
              Role
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
            <label htmlFor="missingSkills" className="block text-sm font-medium text-neutral-300">
              Missing Skills
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="missingSkills"
                id="missingSkills"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. System Design, Distributed Systems"
                value={formData.missingSkills}
                onChange={(e) => setFormData({ ...formData, missingSkills: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="roleSeniority" className="block text-sm font-medium text-neutral-300">
              Role Seniority
            </label>
            <div className="mt-1">
              <select
                name="roleSeniority"
                id="roleSeniority"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={formData.roleSeniority}
                onChange={(e) => setFormData({ ...formData, roleSeniority: e.target.value })}
                required
              >
                <option value="">Select...</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="techStack" className="block text-sm font-medium text-neutral-300">
              Tech Stack
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="techStack"
                id="techStack"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. JavaScript, React, Node.js"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="interviewType" className="block text-sm font-medium text-neutral-300">
              Interview Type
            </label>
            <div className="mt-1">
              <select
                name="interviewType"
                id="interviewType"
                className="block w-full rounded-md border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={formData.interviewType}
                onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                required
              >
                <option value="">Select...</option>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="System Design">System Design</option>
                <option value="Coding">Coding</option>
                <option value="Other">Other</option>
              </select>
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