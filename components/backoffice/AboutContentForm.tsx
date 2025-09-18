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
    | "cta";
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
] as const;

const sectionLabels = {
  hero: "Hero Section",
  story: "Our Story",
  values: "Values",
  services: "Services",
  tech: "Technology",
  testimonials: "Testimonials",
  cta: "Call to Action",
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
  const [formData, setFormData] = useState({
    section: "hero" as const,
    title: "",
    subtitle: "",
    content: getDefaultContentForSection("hero"),
    active: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        section: initialData.section,
        title: initialData.title,
        subtitle: initialData.subtitle || "",
        content: initialData.section === "services"
          ? normalizeServicesContent(initialData.content)
          : initialData.content ?? getDefaultContentForSection(initialData.section),
        active: initialData.active,
        sortOrder: initialData.sortOrder,
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
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  rows={4}
                  value={formData.content.description || ""}
                  onChange={(e) =>
                    handleContentChange("description", e.target.value)
                  }
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Visionara is a studio of builders..."
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Call-to-Action Buttons
              </label>
              <div className="mt-2 space-y-2">
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
                        className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        className="text-red-600 hover:text-red-900"
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
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
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
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Story Text
            </label>
            <div className="mt-2">
              <textarea
                id="text"
                rows={6}
                value={formData.content.text || ""}
                onChange={(e) => handleContentChange("text", e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="We started Visionara to give founders..."
              />
            </div>
          </div>
        );

      case "values":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Values
            </label>
            <div className="mt-2 space-y-3">
              {(formData.content.items || []).map(
                (item: any, index: number) => (
                  <div key={index} className="border rounded-md p-3">
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        className="text-red-600 hover:text-red-900"
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
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
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
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Layout
                </label>
                <div className="mt-2">
                  <select
                    value={servicesContent.layout || "grid"}
                    onChange={(e) => handleContentChange("layout", e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="grid">Grid cards</option>
                    <option value="feature">Feature split</option>
                    <option value="list">Stacked list</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Columns
                </label>
                <div className="mt-2">
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Controls desktop column count (1-4).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Section Accent Color
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="#6366F1 or var(--accent)"
                    value={servicesContent.accentColor || ""}
                    onChange={(e) => handleContentChange("accentColor", e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Background Style
                </label>
                <div className="mt-2">
                  <textarea
                    rows={2}
                    placeholder="Optional CSS color or gradient"
                    value={servicesContent.background || ""}
                    onChange={(e) => handleContentChange("background", e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium leading-6 text-gray-900">
                            Title
                          </label>
                          <div className="mt-2">
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
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium leading-6 text-gray-900">
                            Tagline / Badge
                          </label>
                          <div className="mt-2">
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
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium leading-6 text-gray-900">
                            Icon / Image
                          </label>
                          <div className="mt-2">
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
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Supports emoji, lucide icon, or /path/to/icon.svg
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium leading-6 text-gray-900">
                            Card Accent
                          </label>
                          <div className="mt-2">
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
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                          Description
                        </label>
                        <div className="mt-2">
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
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                          Highlights
                        </label>
                        <div className="mt-2 space-y-2">
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
                                className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                  className="text-red-600 hover:text-red-900"
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
                          className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
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
                              className="text-red-600 hover:text-red-900 text-sm"
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
                              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {activeCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCard(index)}
                        className="text-red-600 hover:text-red-900"
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
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
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
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Technologies
            </label>
            <div className="mt-2">
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Testimonials
            </label>
            <div className="mt-2 space-y-3">
              {(formData.content.testimonials || []).map(
                (testimonial: any, index: number) => (
                  <div key={index} className="border rounded-md p-3">
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        className="text-red-600 hover:text-red-900"
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
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
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
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  rows={3}
                  value={formData.content.description || ""}
                  onChange={(e) =>
                    handleContentChange("description", e.target.value)
                  }
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Tell us where you're headed..."
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Call-to-Action Button
              </label>
              <div className="mt-2 space-y-2">
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </>
        );

      case "stats":
        return (
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Statistics
            </label>
            <div className="mt-2 space-y-3">
              {(formData.content.stats || []).map(
                (stat: any, index: number) => (
                  <div key={index} className="border rounded-md p-3">
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        className="text-red-600 hover:text-red-900"
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
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
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
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Content (JSON)
            </label>
            <div className="mt-2">
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono text-xs"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Section Selection */}
            <div className="sm:col-span-3">
              <label
                htmlFor="section"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Section
              </label>
              <div className="mt-2">
                <select
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {sectionLabels[section]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Basic Fields */}
            <div className="sm:col-span-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="subtitle"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Subtitle (Optional)
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    handleInputChange("subtitle", e.target.value)
                  }
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Dynamic Content Fields */}
            {renderContentFields()}

            {/* Settings */}
            <div className="sm:col-span-3">
              <label
                htmlFor="sortOrder"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Sort Order
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    handleInputChange(
                      "sortOrder",
                      parseInt(e.target.value) || 0
                    )
                  }
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
                    onChange={(e) =>
                      handleInputChange("active", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="active"
                    className="ml-2 text-sm font-medium leading-6 text-gray-900"
                  >
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
            {loading ? "Saving..." : initialData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}








