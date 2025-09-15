'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PackageFormData {
  category: 'Web' | 'Mobile' | 'Graphic' | 'Marketing';
  tier: 'Basic' | 'Standard' | 'Enterprise';
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  active: boolean;
  sortOrder: number;
}

interface Package extends PackageFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface PackageFormProps {
  initialData?: Package;
}

const categories = ['Web', 'Mobile', 'Graphic', 'Marketing'] as const;
const tiers = ['Basic', 'Standard', 'Enterprise'] as const;

export default function PackageForm({ initialData }: PackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<PackageFormData>({
    category: 'Web',
    tier: 'Basic',
    priceOnetime: '',
    priceMonthly: '',
    priceYearly: '',
    features: [],
    active: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category,
        tier: initialData.tier,
        priceOnetime: initialData.priceOnetime,
        priceMonthly: initialData.priceMonthly,
        priceYearly: initialData.priceYearly,
        features: initialData.features,
        active: initialData.active,
        sortOrder: initialData.sortOrder,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData
        ? `/api/admin/packages/${initialData.id}`
        : '/api/admin/packages';

      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save package');
      }

      router.push('/backoffice/packages');
      router.refresh();
    } catch (error: any) {
      // Better error handling - don't alert, show in form
      console.error('Error saving package:', error);
      setLoading(false);
      // You could set a form error state here instead of alert
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PackageFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Category and Tier */}
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                Category
              </label>
              <div className="mt-2">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="tier" className="block text-sm font-medium leading-6 text-gray-900">
                Tier
              </label>
              <div className="mt-2">
                <select
                  id="tier"
                  value={formData.tier}
                  onChange={(e) => handleInputChange('tier', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  {tiers.map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="sm:col-span-6">
              <h3 className="text-base font-semibold leading-7 text-gray-900">Pricing</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">Set pricing for different billing periods</p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="priceOnetime" className="block text-sm font-medium leading-6 text-gray-900">
                One-time Price
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="priceOnetime"
                  value={formData.priceOnetime}
                  onChange={(e) => handleInputChange('priceOnetime', e.target.value)}
                  placeholder="CAD $1,499"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="priceMonthly" className="block text-sm font-medium leading-6 text-gray-900">
                Monthly Price
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="priceMonthly"
                  value={formData.priceMonthly}
                  onChange={(e) => handleInputChange('priceMonthly', e.target.value)}
                  placeholder="CAD $99/mo"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="priceYearly" className="block text-sm font-medium leading-6 text-gray-900">
                Yearly Price
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="priceYearly"
                  value={formData.priceYearly}
                  onChange={(e) => handleInputChange('priceYearly', e.target.value)}
                  placeholder="CAD $1,188/yr"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            {/* Features */}
            <div className="sm:col-span-6">
              <label htmlFor="features" className="block text-sm font-medium leading-6 text-gray-900">
                Features
              </label>
              <div className="mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a feature..."
                    className="block flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Add
                  </button>
                </div>

                {formData.features.length > 0 && (
                  <div className="mt-3">
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-sm text-gray-700">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="sm:col-span-3">
              <label htmlFor="sortOrder" className="block text-sm font-medium leading-6 text-gray-900">
                Sort Order
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    id="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="active" className="ml-2 text-sm font-medium leading-6 text-gray-900">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </form>
  );
}