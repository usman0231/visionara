'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  serviceType: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  meta: Record<string, any>;
  createdAt: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactSubmission | null;
}

export default function ContactModal({ isOpen, onClose, contact }: ContactModalProps) {
  if (!contact) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const sendEmail = () => {
    const subject = `Re: ${contact.serviceType || 'Your inquiry'} - ${contact.name}`;
    const body = `Hi ${contact.name},\n\nThank you for your interest in our ${contact.serviceType || 'services'}.\n\nBest regards,\nVisionara Team`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Contact Details
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Header with name and actions */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{contact.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted {formatDate(contact.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={sendEmail}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {contact.email}
                            </a>
                          </div>
                          <button
                            onClick={() => copyToClipboard(contact.email)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {contact.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {contact.phone}
                              </a>
                            </div>
                            <button
                              onClick={() => copyToClipboard(contact.phone || '')}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {contact.company && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{contact.company}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {contact.serviceType && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type
                          </label>
                          <div className="bg-gray-50 px-3 py-2 rounded-md">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                              {contact.serviceType}
                            </span>
                          </div>
                        </div>
                      )}

                      {contact.budget && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget
                          </label>
                          <div className="bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-gray-900">{contact.budget}</span>
                          </div>
                        </div>
                      )}

                      {contact.timeline && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timeline
                          </label>
                          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{contact.timeline}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-md">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {contact.message}
                      </p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  {contact.meta && Object.keys(contact.meta).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Information
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-md">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(contact.meta, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Contact ID: {contact.id}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Close
                    </button>
                    <button
                      onClick={sendEmail}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Reply to Customer
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}