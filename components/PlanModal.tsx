'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PlanInfo {
  name: string;
  category: string;
  price: string;
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanInfo | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function PlanModal({ isOpen, onClose, plan }: PlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const messageWithPlan = plan
        ? `[Plan Inquiry]\nPlan: ${plan.name} (${plan.category})\nPrice: ${plan.price}\n\n${formData.message}`
        : formData.message;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: messageWithPlan,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md max-h-[85vh] flex flex-col transform rounded-2xl bg-[#1a1a2e] border border-[rgba(118,60,172,0.4)] p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                    {success ? 'Thank You!' : 'Get Started'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 pr-1">
                  {success ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-300 mb-4">
                        We&apos;ve received your inquiry and will get back to you shortly.
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-[rgba(118,60,172,0.3)] hover:bg-[rgba(118,60,172,0.5)] text-white rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <>
                      {plan && (
                        <div className="mb-4 p-3 rounded-xl bg-[rgba(118,60,172,0.15)] border border-[rgba(118,60,172,0.3)]">
                          <p className="text-xs text-gray-400 mb-1">Selected Plan</p>
                          <p className="text-base font-semibold text-white">
                            {plan.name} - {plan.category}
                          </p>
                          <p className="text-[#a855f7] font-medium text-sm">{plan.price}</p>
                        </div>
                      )}

                      {error && (
                        <div className="mb-3 p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <label htmlFor="modal-name" className="block text-sm font-medium text-gray-300 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="modal-name"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(118,60,172,0.3)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(118,60,172,0.6)] focus:ring-1 focus:ring-[rgba(118,60,172,0.3)] transition-colors text-sm"
                            placeholder="Your name"
                          />
                        </div>

                        <div>
                          <label htmlFor="modal-email" className="block text-sm font-medium text-gray-300 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="modal-email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(118,60,172,0.3)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(118,60,172,0.6)] focus:ring-1 focus:ring-[rgba(118,60,172,0.3)] transition-colors text-sm"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div>
                          <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-300 mb-1">
                            Phone <span className="text-gray-500">(optional)</span>
                          </label>
                          <input
                            type="tel"
                            id="modal-phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(118,60,172,0.3)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(118,60,172,0.6)] focus:ring-1 focus:ring-[rgba(118,60,172,0.3)] transition-colors text-sm"
                            placeholder="+1 (123) 456-7890"
                          />
                        </div>

                        <div>
                          <label htmlFor="modal-message" className="block text-sm font-medium text-gray-300 mb-1">
                            Message *
                          </label>
                          <textarea
                            id="modal-message"
                            required
                            rows={2}
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(118,60,172,0.3)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(118,60,172,0.6)] focus:ring-1 focus:ring-[rgba(118,60,172,0.3)] transition-colors resize-none text-sm"
                            placeholder="Tell us about your project..."
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-[rgba(255,255,255,0.05)] rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#763cac] to-[#a855f7] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {loading ? 'Sending...' : 'Send Inquiry'}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
