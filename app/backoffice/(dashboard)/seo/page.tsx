"use client";

import { useState, useEffect } from "react";
import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";

interface SEOData {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogImageAlt: string | null;
  twitterCard: string;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  canonicalUrl: string | null;
  robots: string;
  structuredData: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SEOManagement() {
  const [seos, setSeos] = useState<SEOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeo, setSelectedSeo] = useState<SEOData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSeos();
  }, []);

  const fetchSeos = async () => {
    try {
      const response = await fetch("/api/admin/seo");
      if (response.ok) {
        const data = await response.json();
        setSeos(data);
      }
    } catch (error) {
      console.error("Error fetching SEOs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seo: SEOData) => {
    setSelectedSeo(seo);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSeo(null);
    setIsModalOpen(true);
  };

  const getPageLabel = (page: string) => {
    const labels: { [key: string]: string } = {
      global: "Global (Default)",
      home: "Home Page",
      contact: "Contact Page",
      about: "About Page",
      services: "Services Page",
    };
    return labels[page] || page;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">SEO Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage SEO settings for all pages. Optimize titles, descriptions, and social media tags for better search engine visibility.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Page
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Page
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {seos.map((seo) => (
                    <tr key={seo.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {getPageLabel(seo.page)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{seo.title}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="max-w-md truncate">{seo.description}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            seo.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {seo.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(seo)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <SEOModal
          seo={selectedSeo}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSeo(null);
          }}
          onSave={() => {
            fetchSeos();
            setIsModalOpen(false);
            setSelectedSeo(null);
          }}
        />
      )}
    </div>
  );
}

function SEOModal({
  seo,
  onClose,
  onSave,
}: {
  seo: SEOData | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    page: seo?.page || "",
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords || "",
    ogTitle: seo?.ogTitle || "",
    ogDescription: seo?.ogDescription || "",
    ogImage: seo?.ogImage || "",
    ogImageAlt: seo?.ogImageAlt || "",
    twitterCard: seo?.twitterCard || "summary_large_image",
    twitterTitle: seo?.twitterTitle || "",
    twitterDescription: seo?.twitterDescription || "",
    twitterImage: seo?.twitterImage || "",
    canonicalUrl: seo?.canonicalUrl || "",
    robots: seo?.robots || "index, follow",
    structuredData: seo?.structuredData
      ? JSON.stringify(seo.structuredData, null, 2)
      : "",
    isActive: seo?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "social" | "advanced">("basic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let structuredDataObj = null;
      if (formData.structuredData) {
        try {
          structuredDataObj = JSON.parse(formData.structuredData);
        } catch (error) {
          alert("Invalid JSON in Structured Data field");
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        structuredData: structuredDataObj,
      };

      const url = seo ? `/api/admin/seo/${seo.id}` : "/api/admin/seo";
      const method = seo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save SEO configuration");
      }
    } catch (error) {
      console.error("Error saving SEO:", error);
      alert("Failed to save SEO configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative inline-block bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {seo ? "Edit SEO Configuration" : "Create SEO Configuration"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className={`${
                      activeTab === "basic"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Basic SEO
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("social")}
                    className={`${
                      activeTab === "social"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Social Media
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    className={`${
                      activeTab === "advanced"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Advanced
                  </button>
                </nav>
              </div>

              {/* Basic Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Page Identifier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="page"
                      value={formData.page}
                      onChange={handleChange}
                      disabled={!!seo}
                      required
                      placeholder="e.g., home, contact, about, services"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Unique identifier for this page (e.g., "home", "contact", "about")
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">
                        ({formData.title.length}/70)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      maxLength={70}
                      placeholder="Compelling page title (50-60 characters optimal)"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Meta Description <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">
                        ({formData.description.length}/160)
                      </span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      maxLength={160}
                      rows={3}
                      placeholder="Compelling description for search results (150-160 characters optimal)"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Keywords
                    </label>
                    <textarea
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Comma-separated keywords (e.g., web development, mobile apps, AI solutions)"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === "social" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Open Graph (Facebook)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          OG Title
                        </label>
                        <input
                          type="text"
                          name="ogTitle"
                          value={formData.ogTitle}
                          onChange={handleChange}
                          maxLength={70}
                          placeholder="Title for social media shares"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          OG Description
                        </label>
                        <textarea
                          name="ogDescription"
                          value={formData.ogDescription}
                          onChange={handleChange}
                          rows={2}
                          maxLength={200}
                          placeholder="Description for social media shares"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          OG Image URL
                        </label>
                        <input
                          type="url"
                          name="ogImage"
                          value={formData.ogImage}
                          onChange={handleChange}
                          placeholder="https://www.visionara.ca/images/og-image.jpg"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          OG Image Alt Text
                        </label>
                        <input
                          type="text"
                          name="ogImageAlt"
                          value={formData.ogImageAlt}
                          onChange={handleChange}
                          placeholder="Description of the image"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Twitter Card</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Twitter Card Type
                        </label>
                        <select
                          name="twitterCard"
                          value={formData.twitterCard}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">Summary Large Image</option>
                          <option value="app">App</option>
                          <option value="player">Player</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Twitter Title
                        </label>
                        <input
                          type="text"
                          name="twitterTitle"
                          value={formData.twitterTitle}
                          onChange={handleChange}
                          maxLength={70}
                          placeholder="Title for Twitter card"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Twitter Description
                        </label>
                        <textarea
                          name="twitterDescription"
                          value={formData.twitterDescription}
                          onChange={handleChange}
                          rows={2}
                          maxLength={200}
                          placeholder="Description for Twitter card"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Twitter Image URL
                        </label>
                        <input
                          type="url"
                          name="twitterImage"
                          value={formData.twitterImage}
                          onChange={handleChange}
                          placeholder="https://www.visionara.ca/images/twitter-card.jpg"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === "advanced" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      name="canonicalUrl"
                      value={formData.canonicalUrl}
                      onChange={handleChange}
                      placeholder="https://www.visionara.ca/page"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The preferred URL for this page (helps prevent duplicate content)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Robots Meta Tag
                    </label>
                    <select
                      name="robots"
                      value={formData.robots}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    >
                      <option value="index, follow">Index, Follow (Default)</option>
                      <option value="noindex, follow">No Index, Follow</option>
                      <option value="index, nofollow">Index, No Follow</option>
                      <option value="noindex, nofollow">No Index, No Follow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Structured Data (JSON-LD)
                    </label>
                    <textarea
                      name="structuredData"
                      value={formData.structuredData}
                      onChange={handleChange}
                      rows={12}
                      placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-xs px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      JSON-LD structured data for rich snippets in search results
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
