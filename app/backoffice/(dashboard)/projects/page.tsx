'use client';

import { useState, useEffect } from 'react';
import { FolderIcon, PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/backoffice/PageHeader';
import ToggleSwitch from '@/components/backoffice/ToggleSwitch';
import { useNotification } from '@/components/backoffice/NotificationProvider';
import ProjectModal from '@/components/backoffice/ProjectModal';

interface ServiceInfo {
  id: string;
  title: string;
}

interface ProjectImage {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  serviceId: string | null;
  coverImage: string;
  priority: number;
  active: boolean;
  createdAt: string;
  service?: ServiceInfo | null;
  images?: ProjectImage[];
}

export default function ProjectsPage() {
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterServiceId, setFilterServiceId] = useState<string>('');

  // Filter projects based on selected service
  const filteredProjects = filterServiceId
    ? projects.filter(p => p.serviceId === filterServiceId)
    : projects;

  useEffect(() => {
    fetchProjects();
    fetchServices();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      await fetchProjects();
      showNotification('Project deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete project: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, active: !currentActive } : project
      )
    );
  };

  const openModal = (project?: Project) => {
    setEditingProject(project || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleSaveProject = async () => {
    await fetchProjects();
    closeModal();
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects. Each project can have multiple images."
        icon={<FolderIcon className="h-6 w-6" />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        action={{
          label: "Add Project",
          onClick: () => openModal(),
          icon: <PlusIcon className="h-4 w-4" />
        }}
      />

      {/* Instructions */}
      <div className="mt-8 mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Projects Management</h3>
            <div className="mt-1 text-sm text-blue-700">
              Create projects with a cover image and multiple gallery images. Lower priority number = higher ranking. Max 8 projects shown per category on frontend.
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Service */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="serviceFilter" className="text-sm font-medium text-gray-700">
          Filter by Service:
        </label>
        <select
          id="serviceFilter"
          value={filterServiceId}
          onChange={(e) => setFilterServiceId(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="">All Services</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Projects</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{projects.length}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Active Projects</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {projects.filter(p => p.active).length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Images</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {projects.reduce((acc, p) => acc + (p.images?.length || 0), 0)}
          </dd>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/10"
          >
            {/* Cover Image */}
            <div className="aspect-video relative bg-gray-100">
              <img
                src={project.coverImage}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=';
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(project)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Status badges */}
              {!project.active && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center rounded-md bg-gray-100/90 px-2 py-1 text-xs font-medium text-gray-600">
                    Inactive
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  Priority: {project.priority}
                </span>
              </div>
              {/* Image count */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md">
                <PhotoIcon className="h-4 w-4 text-white" />
                <span className="text-xs font-medium text-white">{project.images?.length || 0}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={project.title}>
                    {project.title}
                  </h3>
                  {project.service && (
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 mt-1">
                      {project.service.title}
                    </span>
                  )}
                </div>
                <ToggleSwitch
                  enabled={project.active}
                  onChange={() => {}}
                  onToggle={() => handleToggleActive(project.id, project.active)}
                  showNotification={showNotification}
                  successMessage={project.active ? 'Project hidden' : 'Project published'}
                  size="sm"
                />
              </div>
              {project.description && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{project.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {filterServiceId ? 'No projects for this service' : 'No projects'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterServiceId ? 'Try selecting a different service or create a new project.' : 'Get started by creating your first project.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Add Project
            </button>
          </div>
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProject}
        project={editingProject}
        services={services}
      />
    </div>
  );
}
