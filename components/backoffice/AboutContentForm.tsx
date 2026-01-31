"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

interface AboutContent {
  id: string;
  section:
    | "hero"
    | "story"
    | "values"
    | "services"
    | "tech"
    | "testimonials"
    | "cta"
    | "stats";
  title: string;
  subtitle: string | null;
  content: Record<string, any>;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AboutContentFormProps {
  initialData?: AboutContent;
}

const sections = [
  "hero",
  "story",
  "values",
  "services",
  "tech",
  "testimonials",
  "cta",
  "stats",
] as const;

const sectionLabels = {
  hero: "Hero Section",
  story: "Our Story",
  values: "Values",
  services: "Services",
  tech: "Technology",
  testimonials: "Testimonials",
  cta: "Call to Action",
  stats: "Statistics",
};

type SectionOption = (typeof sections)[number];

type ServicesLayout = "grid" | "list" | "feature";

interface ServiceCardState {
  title: string;
  tagline?: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  items: string[];
  cta?: { text: string; href: string } | undefined;
}

interface ServicesContentState {
  layout?: ServicesLayout;
  columns?: number;
  accentColor?: string;
  background?: string;
  items: ServiceCardState[];
}

type FormState = {
  section: SectionOption;
  title: string;
  subtitle: string;
  content: Record<string, any>;
  active: boolean;
};

const defaultServiceCard = (): ServiceCardState => ({
  title: "",
  tagline: "",
  description: "",
  icon: "",
  accentColor: "",
  items: [""],
  cta: undefined,
});

const normalizeServiceCard = (card?: any): ServiceCardState => {
  const rawItems = Array.isArray(card?.items) ? card.items : [];
  const items = rawItems
    .map((item: any) => {
      if (typeof item === "string") return item;
      if (item && typeof item.text === "string") return item.text;
      return "";
    });
  if (items.length === 0) {
    items.push("");
  }
  return {
    title: card?.title ?? "",
    tagline: card?.tagline ?? "",
    description: card?.description ?? "",
    icon: card?.icon ?? "",
    accentColor: card?.accentColor ?? "",
    items,
    cta:
      card?.cta && typeof card.cta === "object" && typeof card.cta.text === "string"
        ? { text: card.cta.text, href: card.cta.href ?? "" }
        : undefined,
  };
};

const normalizeServicesContent = (content?: any): ServicesContentState => {
  const cards =
    Array.isArray(content?.items) && content.items.length > 0
      ? content.items.map(normalizeServiceCard)
      : [defaultServiceCard()];
  return {
    layout: content?.layout ?? "grid",
    columns: typeof content?.columns === "number" ? content.columns : 4,
    accentColor: content?.accentColor ?? "",
    background: content?.background ?? "",
    items: cards,
  };
};

const getDefaultContentForSection = (section: SectionOption): Record<string, any> => {
  switch (section) {
    case "services":
      return normalizeServicesContent();
    case "values":
      return { items: [{ title: "", description: "" }] };
    case "tech":
      return { technologies: [] };
    case "testimonials":
      return { testimonials: [{ quote: "", attribution: "" }] };
    case "hero":
      return { description: "", buttons: [] };
    case "story":
      return { text: "" };
    case "cta":
      return { description: "", button: { text: "", href: "" } };
    default:
      return {};
  }
};

export default function AboutContentForm({
  initialData,
}: AboutContentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    section: "hero",
    title: "",
    subtitle: "",
    content: getDefaultContentForSection("hero"),
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        section: initialData.section as SectionOption,
        title: initialData.title,
        subtitle: initialData.subtitle || "",
        content: initialData.section === "services"
          ? normalizeServicesContent(initialData.content)
          : initialData.content ?? getDefaultContentForSection(initialData.section),
        active: initialData.active,
      });
    }
  }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let payload: any = {
      ...formData,
      subtitle: formData.subtitle || null,
      content: formData.content,
      sortOrder: initialData?.sortOrder, // Keep existing order for updates, let API handle new ones
    };

    if (formData.section === "services") {
      const servicesContent = formData.content as ServicesContentState;
      const cleanedItems = (servicesContent.items || [])
        .map((service) => {
          const details: string[] = (service.items || [])
            .map((item) => (item ?? "").toString())
            .filter((item) => item.trim().length > 0);

          return {
            title: (service.title || "").trim(),
            tagline: service.tagline?.trim() || undefined,
            description: service.description?.trim() || undefined,
            icon: service.icon?.trim() || undefined,
            accentColor: service.accentColor?.trim() || undefined,
            items: details,
            cta:
              service.cta && service.cta.text?.trim() && service.cta.href?.trim()
                ? {
                    text: service.cta.text.trim(),
                    href: service.cta.href.trim(),
                  }
                : undefined,
          };
        })
        .filter((service) => service.title.length > 0 && service.items.length > 0);

      if (!cleanedItems.length) {
        alert("Add at least one service card with a title and at least one detail.");
        setLoading(false);
        return;
      }

      const parsedColumns =
        typeof servicesContent.columns === "number" && Number.isFinite(servicesContent.columns)
          ? Math.min(Math.max(Math.round(servicesContent.columns), 1), 4)
          : undefined;

      payload = {
        ...payload,
        content: {
          layout: servicesContent.layout || "grid",
          columns: parsedColumns,
          accentColor: servicesContent.accentColor?.trim() ? servicesContent.accentColor : undefined,
          background: servicesContent.background?.trim() ? servicesContent.background : undefined,
          items: cleanedItems,
        },
      };
    }

    try {
      const url = initialData
        ? `/api/admin/about-content/${initialData.id}`
        : "/api/admin/about-content";

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save content");
      }

      router.push("/backoffice/about-us");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving content:", error);
      alert(error.message || "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "section") {
      setFormData((prev) => ({
        ...prev,
        section: value as SectionOption,
        content: getDefaultContentForSection(value as SectionOption),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContentChange = (contentField: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [contentField]: value,
      },
    }));
  };

  // Dynamic content fields based on section
  const renderContentFields = () => {
    switch (formData.section) {
      case "hero":
        return (
          <>
            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description
              </label>
              <div>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.content.description || ""}
                  onChange={(e) =>
                    handleContentChange("description", e.target.value)
                  }
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                  placeholder="Visionara is a studio of builders..."
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Call-to-Action Buttons
              </label>
              <div className="space-y-3">
                {(formData.content.buttons || []).map(
                  (button: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Button text"
                        value={button.text || ""}
                        onChange={(e) => {
                          const newButtons = [
                            ...(formData.content.buttons || []),
                          ];
                          newButtons[index] = {
                            ...button,
                            text: e.target.value,
                          };
                          handleContentChange("buttons", newButtons);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Button link"
                        value={button.href || ""}
                        onChange={(e) => {
                          const newButtons = [
                            ...(formData.content.buttons || []),
                          ];
                          newButtons[index] = {
                            ...button,
                            href: e.target.value,
                          };
                          handleContentChange("buttons", newButtons);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={button.primary || false}
                          onChange={(e) => {
                            const newButtons = [
                              ...(formData.content.buttons || []),
                            ];
                            newButtons[index] = {
                              ...button,
                              primary: e.target.checked,
                            };
                            handleContentChange("buttons", newButtons);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        />
                        <span className="text-sm">Primary</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newButtons = (
                            formData.content.buttons || []
                          ).filter((_: any, i: number) => i !== index);
                          handleContentChange("buttons", newButtons);
                        }}
                        className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    const newButtons = [
                      ...(formData.content.buttons || []),
                      { text: "", href: "", primary: false },
                    ];
                    handleContentChange("buttons", newButtons);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Button
                </button>
              </div>
            </div>
          </>
        );

      case "story":
        return (
          <div className="sm:col-span-6">
            <label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Story Text
            </label>
            <div>
              <textarea
                id="text"
                rows={6}
                value={formData.content.text || ""}
                onChange={(e) => handleContentChange("text", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                placeholder="We started Visionara to give founders..."
              />
            </div>
          </div>
        );

      case "values":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Values
            </label>
            <div className="space-y-3">
              {(formData.content.items || []).map(
                (item: any, index: number) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 hover:border-gray-300 transition-colors duration-200">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Value title (e.g., Clarity)"
                          value={item.title || ""}
                          onChange={(e) => {
                            const newItems = [
                              ...(formData.content.items || []),
                            ];
                            newItems[index] = {
                              ...item,
                              title: e.target.value,
                            };
                            handleContentChange("items", newItems);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                        <textarea
                          placeholder="Value description"
                          rows={2}
                          value={item.description || ""}
                          onChange={(e) => {
                            const newItems = [
                              ...(formData.content.items || []),
                            ];
                            newItems[index] = {
                              ...item,
                              description: e.target.value,
                            };
                            handleContentChange("items", newItems);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = (
                            formData.content.items || []
                          ).filter((_: any, i: number) => i !== index);
                          handleContentChange("items", newItems);
                        }}
                        className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  const newItems = [
                    ...(formData.content.items || []),
                    { title: "", description: "" },
                  ];
                  handleContentChange("items", newItems);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                Add Value
              </button>
            </div>
          </div>
        );

      case "services": {
        const servicesContent = formData.content as ServicesContentState;
        const activeCards =
          Array.isArray(servicesContent.items) && servicesContent.items.length > 0
            ? servicesContent.items
            : [defaultServiceCard()];

        const setCards = (nextCards: ServiceCardState[]) => {
          handleContentChange("items", nextCards);
        };

        const updateCard = (
          index: number,
          updater: (card: ServiceCardState) => ServiceCardState
        ) => {
          const next = activeCards.map((card, cardIndex) =>
            cardIndex === index ? updater(card) : card
          );
          setCards(next);
        };

        const addCard = () => {
          setCards([...activeCards, defaultServiceCard()]);
        };

        const removeCard = (index: number) => {
          const next = activeCards.filter((_, cardIndex) => cardIndex !== index);
          setCards(next.length > 0 ? next : [defaultServiceCard()]);
        };

        return (
          <div className="sm:col-span-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Layout
                </label>
                <div>
                  <select
                    value={servicesContent.layout || "grid"}
                    onChange={(e) => handleContentChange("layout", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                  >
                    <option value="grid">Grid cards</option>
                    <option value="feature">Feature split</option>
                    <option value="list">Stacked list</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Columns
                </label>
                <div>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={servicesContent.columns ?? 4}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleContentChange("columns", undefined);
                        return;
                      }
                      const parsed = Math.min(
                        4,
                        Math.max(1, Number.parseInt(value, 10) || 1)
                      );
                      handleContentChange("columns", parsed);
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Controls desktop column count (1-4).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Section Accent Color
                </label>
                <div>
                  <input
                    type="text"
                    placeholder="#6366F1 or var(--accent)"
                    value={servicesContent.accentColor || ""}
                    onChange={(e) => handleContentChange("accentColor", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Background Style
                </label>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Optional CSS color or gradient"
                    value={servicesContent.background || ""}
                    onChange={(e) => handleContentChange("background", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  e.g. linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
                </p>
              </div>
            </div>

            {activeCards.map((service, index) => {
              const details =
                Array.isArray(service.items) && service.items.length > 0
                  ? service.items
                  : [""];
              return (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 space-y-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Title
                          </label>
                          <div>
                            <input
                              type="text"
                              placeholder="Service title"
                              value={service.title}
                              onChange={(e) =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  title: e.target.value,
                                }))
                              }
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tagline / Badge
                          </label>
                          <div>
                            <input
                              type="text"
                              placeholder="e.g., End-to-end delivery"
                              value={service.tagline || ""}
                              onChange={(e) =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  tagline: e.target.value,
                                }))
                              }
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Icon / Image
                          </label>
                          <div>
                            <input
                              type="text"
                              placeholder="Emoji, icon name, or image URL"
                              value={service.icon || ""}
                              onChange={(e) =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  icon: e.target.value,
                                }))
                              }
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Supports emoji, lucide icon, or /path/to/icon.svg
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Card Accent
                          </label>
                          <div>
                            <input
                              type="text"
                              placeholder="#F97316"
                              value={service.accentColor || ""}
                              onChange={(e) =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  accentColor: e.target.value,
                                }))
                              }
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Description
                        </label>
                        <div>
                          <textarea
                            rows={3}
                            placeholder="Short blurb or differentiator"
                            value={service.description || ""}
                            onChange={(e) =>
                              updateCard(index, (card) => ({
                                ...card,
                                description: e.target.value,
                              }))
                            }
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Highlights
                        </label>
                        <div className="space-y-3">
                          {details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-start gap-2">
                              <input
                                type="text"
                                value={detail}
                                onChange={(e) =>
                                  updateCard(index, (card) => {
                                    const nextDetails = [...(card.items || [])];
                                    nextDetails[detailIndex] = e.target.value;
                                    return { ...card, items: nextDetails };
                                  })
                                }
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                              />
                              {details.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCard(index, (card) => {
                                      const nextDetails = (card.items || []).filter(
                                        (_, i) => i !== detailIndex
                                      );
                                      return {
                                        ...card,
                                        items: nextDetails.length ? nextDetails : [""],
                                      };
                                    })
                                  }
                                  className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateCard(index, (card) => ({
                              ...card,
                              items: [...(card.items || []), ""],
                            }))
                          }
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Detail
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium leading-6 text-gray-900">
                            CTA (optional)
                          </span>
                          {service.cta ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  cta: undefined,
                                }))
                              }
                              className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200 text-sm"
                            >
                              Remove CTA
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  cta: { text: "", href: "" },
                                }))
                              }
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                            >
                              Add CTA
                            </button>
                          )}
                        </div>
                        {service.cta && (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <input
                              type="text"
                              placeholder="Button text"
                              value={service.cta.text}
                              onChange={(e) =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  cta: { ...(card.cta || { href: "" }), text: e.target.value },
                                }))
                              }
                              className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                            />
                            <input
                              type="text"
                              placeholder="/contact or https://"
                              value={service.cta.href}
                              onChange={(e) =>
                                updateCard(index, (card) => ({
                                  ...card,
                                  cta: { ...(card.cta || { text: "" }), href: e.target.value },
                                }))
                              }
                              className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {activeCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCard(index)}
                        className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addCard}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              Add Service
            </button>
          </div>
        );
      }

      case "tech":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Technologies
            </label>
            <div>
              <textarea
                placeholder="Enter technologies separated by commas (e.g., Next.js, React, TypeScript)"
                rows={3}
                defaultValue={(formData.content.technologies || []).join(", ")}
                onBlur={(e) => {
                  // Process the value when user finishes editing
                  const technologies = e.target.value
                    .split(",")
                    .map((tech) => tech.trim())
                    .filter(Boolean);
                  handleContentChange("technologies", technologies);
                }}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
              />
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Testimonials
            </label>
            <div className="space-y-3">
              {(formData.content.testimonials || []).map(
                (testimonial: any, index: number) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 hover:border-gray-300 transition-colors duration-200">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <textarea
                          placeholder="Quote"
                          rows={2}
                          value={testimonial.quote || ""}
                          onChange={(e) => {
                            const newTestimonials = [
                              ...(formData.content.testimonials || []),
                            ];
                            newTestimonials[index] = {
                              ...testimonial,
                              quote: e.target.value,
                            };
                            handleContentChange("testimonials", newTestimonials);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Attribution (e.g., Ã¢â‚¬â€ CTO, SaaS Startup)"
                          value={testimonial.attribution || ""}
                          onChange={(e) => {
                            const newTestimonials = [
                              ...(formData.content.testimonials || []),
                            ];
                            newTestimonials[index] = {
                              ...testimonial,
                              attribution: e.target.value,
                            };
                            handleContentChange("testimonials", newTestimonials);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTestimonials = (
                            formData.content.testimonials || []
                          ).filter((_: any, i: number) => i !== index);
                          handleContentChange("testimonials", newTestimonials);
                        }}
                        className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  const newTestimonials = [
                    ...(formData.content.testimonials || []),
                    { quote: "", attribution: "" },
                  ];
                  handleContentChange("testimonials", newTestimonials);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                Add Testimonial
              </button>
            </div>
          </div>
        );

      case "cta":
        return (
          <>
            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description
              </label>
              <div>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.content.description || ""}
                  onChange={(e) =>
                    handleContentChange("description", e.target.value)
                  }
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                  placeholder="Tell us where you're headed..."
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Call-to-Action Button
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Button text"
                  value={formData.content.button?.text || ""}
                  onChange={(e) => {
                    const newButton = {
                      ...formData.content.button,
                      text: e.target.value,
                    };
                    handleContentChange("button", newButton);
                  }}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Button link"
                  value={formData.content.button?.href || ""}
                  onChange={(e) => {
                    const newButton = {
                      ...formData.content.button,
                      href: e.target.value,
                    };
                    handleContentChange("button", newButton);
                  }}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                />
              </div>
            </div>
          </>
        );

      case "stats":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Statistics
            </label>
            <div className="space-y-3">
              {(formData.content.stats || []).map(
                (stat: any, index: number) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 hover:border-gray-300 transition-colors duration-200">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Value (e.g., 20, 97)"
                          value={stat.value || ""}
                          onChange={(e) => {
                            const newStats = [
                              ...(formData.content.stats || []),
                            ];
                            // Allow any input while typing, only validate when complete
                            const numValue = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                            newStats[index] = {
                              ...stat,
                              value: numValue,
                            };
                            handleContentChange("stats", newStats);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Label (e.g., projects shipped)"
                          value={stat.label || ""}
                          onChange={(e) => {
                            const newStats = [
                              ...(formData.content.stats || []),
                            ];
                            newStats[index] = {
                              ...stat,
                              label: e.target.value,
                            };
                            handleContentChange("stats", newStats);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Prefix (e.g., 2Ã¢â‚¬â€œ)"
                          value={stat.prefix || ""}
                          onChange={(e) => {
                            const newStats = [
                              ...(formData.content.stats || []),
                            ];
                            newStats[index] = {
                              ...stat,
                              prefix: e.target.value,
                            };
                            handleContentChange("stats", newStats);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Suffix (e.g., +, %, wks)"
                          value={stat.suffix || ""}
                          onChange={(e) => {
                            const newStats = [
                              ...(formData.content.stats || []),
                            ];
                            newStats[index] = {
                              ...stat,
                              suffix: e.target.value,
                            };
                            handleContentChange("stats", newStats);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newStats = (
                            formData.content.stats || []
                          ).filter((_: any, i: number) => i !== index);
                          handleContentChange("stats", newStats);
                        }}
                        className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  const newStats = [
                    ...(formData.content.stats || []),
                    { id: Date.now(), value: 0, prefix: "", suffix: "", label: "" },
                  ];
                  handleContentChange("stats", newStats);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                Add Statistic
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="sm:col-span-6">
            <label
              htmlFor="content-json"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Content (JSON)
            </label>
            <div>
              <textarea
                id="content-json"
                rows={6}
                value={JSON.stringify(formData.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange("content", parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm font-mono text-xs"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {initialData ? 'Edit Content Block' : 'Create Content Block'}
                </h2>
                <p className="text-sm text-gray-600">
                  Configure the content for your About Us page section
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <p className="text-sm text-gray-600 mt-1">Set the fundamental details for this content block</p>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Section Type */}
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-900 mb-2">
                  Section Type
                </label>
                <select
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {sectionLabels[section]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1.5">Choose the type of content section</p>
              </div>

              {/* Display Order - only shown when editing */}
              {initialData && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Display Order
                  </label>
                  <div className="block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-gray-500 bg-gray-50 sm:text-sm">
                    #{initialData.sortOrder}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Order is automatically managed</p>
                </div>
              )}

              {/* Status Toggle */}
              <div className={initialData ? '' : 'sm:col-span-1'}>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleInputChange("active", !formData.active)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      formData.active
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 focus:ring-emerald-300'
                        : 'bg-gray-300 focus:ring-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                        formData.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <span className={`text-sm font-medium ${formData.active ? 'text-emerald-700' : 'text-gray-600'}`}>
                      {formData.active ? 'Published' : 'Draft'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formData.active ? 'Visible on website' : 'Hidden from website'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="Enter a descriptive title for this section"
                  required
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-900 mb-2">
                  Subtitle
                  <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange("subtitle", e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="Add a subtitle or supporting text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Configuration Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {sectionLabels[formData.section]} Configuration
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Customize the specific content for this {sectionLabels[formData.section].toLowerCase()} section
            </p>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-6">
              {renderContentFields()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="flex items-center justify-between gap-x-6 px-6 py-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Saving..." : initialData ? "Update Content" : "Create Content"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}








