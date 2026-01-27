'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  service?: ServiceInfo | null;
  images?: ProjectImage[];
}

export default function AchievementsGallery() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter projects based on active tab (max 8 per category)
  const filteredProjects = useMemo(() =>
    activeTab === 'all'
      ? projects.slice(0, 8)
      : projects.filter(p => p.serviceId === activeTab).slice(0, 8),
    [activeTab, projects]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, servicesResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/services')
        ]);

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects || []);
        }

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.services || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading || projects.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduce) return;

      gsap.from('.ag__header .reveal', {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });

      gsap.from('.ag__tile', {
        opacity: 0,
        y: 26,
        scale: 0.98,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true },
      });
    }, ref);

    return () => ctx.revert();
  }, [loading, projects]);

  // Animate tiles when tab changes
  useEffect(() => {
    setSelectedProject(null);

    if (loading || filteredProjects.length === 0) return;

    const tiles = document.querySelectorAll('.ag__tile');
    gsap.fromTo(tiles,
      { opacity: 0, y: 20, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.04,
      }
    );
  }, [activeTab, filteredProjects.length, loading]);

  // Body lock while lightbox open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (selectedProject !== null) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [selectedProject]);

  // Get all images for selected project (cover + gallery images)
  const getAllProjectImages = useCallback((project: Project): { url: string; alt: string }[] => {
    const allImages: { url: string; alt: string }[] = [
      { url: project.coverImage, alt: project.title }
    ];
    if (project.images && project.images.length > 0) {
      project.images.forEach(img => {
        allImages.push({ url: img.imageUrl, alt: img.alt });
      });
    }
    return allImages;
  }, []);

  const openProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  }, []);

  const closeProject = useCallback(() => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    if (!selectedProject) return;
    const images = getAllProjectImages(selectedProject);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [selectedProject, getAllProjectImages]);

  const prevImage = useCallback(() => {
    if (!selectedProject) return;
    const images = getAllProjectImages(selectedProject);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [selectedProject, getAllProjectImages]);

  if (loading) {
    return (
      <section className="ag mb-30">
        <header className="ag__header">
          <h2>
            <span className="ag__headlineFill">Our Achievements</span>
          </h2>
          <p className="ag__sub">Loading our projects...</p>
        </header>
        <div className="ag__grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ag__tile animate-pulse">
              <div className="ag__imgWrap">
                <div className="h-full bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="ag mb-30">
      <header className="ag__header">
        <h2 className="reveal">
          <span className="ag__headlineFill">Our Achievements</span>
          <span className="ag__headlineSheen" aria-hidden />
        </h2>
        <p className="ag__sub reveal">Highlights from our recent work and recognition.</p>
      </header>

      {/* Service Tabs */}
      <div className="ag__tabs">
        <button
          className={`ag__tab ${activeTab === 'all' ? 'ag__tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        {services.map((service) => (
          <button
            key={service.id}
            className={`ag__tab ${activeTab === service.id ? 'ag__tab--active' : ''}`}
            onClick={() => setActiveTab(service.id)}
          >
            {service.title}
          </button>
        ))}
      </div>

      <div className="ag__grid">
        {filteredProjects.length === 0 ? (
          <div className="ag__empty">
            <p>No projects found for this category.</p>
          </div>
        ) : filteredProjects.map((project) => (
          <figure
            key={project.id}
            className="ag__tile"
            role="button"
            tabIndex={0}
            aria-label={`View ${project.title}`}
            onClick={() => openProject(project)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openProject(project)}
          >
            <span className="ag__border" aria-hidden />
            <div className="ag__imgWrap">
              <Image
                fill
                src={project.coverImage}
                alt={project.title}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
                className="ag__img"
                priority={filteredProjects.indexOf(project) < 3}
                loading={filteredProjects.indexOf(project) < 3 ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              <span className="ag__shine" aria-hidden />
            </div>
            {/* Project title overlay */}
            <div className="ag__titleOverlay">
              <h3 className="ag__projectTitle">{project.title}</h3>
              {project.images && project.images.length > 0 && (
                <span className="ag__imageCount">{project.images.length + 1} images</span>
              )}
            </div>
          </figure>
        ))}
      </div>

      {/* Project Lightbox */}
      {selectedProject && (
        <div className="ag__lightbox" role="dialog" aria-modal="true" aria-label="Project viewer">
          <button className="ag__close" aria-label="Close" onClick={closeProject}>✕</button>

          {getAllProjectImages(selectedProject).length > 1 && (
            <>
              <button
                className="ag__nav ag__nav--prev"
                aria-label="Previous"
                onClick={prevImage}
              >‹</button>
              <button
                className="ag__nav ag__nav--next"
                aria-label="Next"
                onClick={nextImage}
              >›</button>
            </>
          )}

          <div className="ag__lightboxContent">
            <div className="ag__lightboxImgWrap">
              <Image
                key={currentImageIndex}
                fill
                src={getAllProjectImages(selectedProject)[currentImageIndex]?.url}
                alt={getAllProjectImages(selectedProject)[currentImageIndex]?.alt}
                sizes="100vw"
                className="ag__lightboxImg"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>

            {/* Project Info */}
            <div className="ag__projectInfo">
              <h3 className="ag__projectInfoTitle">{selectedProject.title}</h3>
              {selectedProject.description && (
                <p className="ag__projectInfoDesc">{selectedProject.description}</p>
              )}
              {/* Image counter */}
              <div className="ag__imageCounter">
                {currentImageIndex + 1} / {getAllProjectImages(selectedProject).length}
              </div>
              {/* Thumbnails */}
              {getAllProjectImages(selectedProject).length > 1 && (
                <div className="ag__thumbnails">
                  {getAllProjectImages(selectedProject).map((img, idx) => (
                    <button
                      key={idx}
                      className={`ag__thumbnail ${idx === currentImageIndex ? 'ag__thumbnail--active' : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ag {
          width: min(1200px, 95vw);
          margin-inline: auto;
          padding: 4rem 0 5rem;
          color: var(--text1);
          background:
            radial-gradient(1200px 400px at 10% -10%, rgba(118,60,172,.12), transparent 40%),
            radial-gradient(900px 300px at 90% 110%, rgba(118,60,172,.12), transparent 40%);
        }

        .ag__header { text-align:center; margin-bottom: 1.2rem; }
        .ag__header h2 {
          position: relative;
          display:inline-block;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          line-height:1.1;
          margin:0 0 .4rem;
        }
        .ag__headlineFill {
          position: relative;
          display: inline-block;
          background: linear-gradient(
            110deg,
            var(--text1),
            var(--foreground),
            var(--text1)
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: textShine 4s ease-in-out infinite;
        }
        .ag__headlineFill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine 3s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: overlay;
        }
        .ag__headlineSheen {
          display: none;
        }
        .ag__sub { opacity:.8; max-width:640px; margin:0 auto; }

        /* Service Tabs */
        .ag__tabs {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }
        .ag__tab {
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text2, rgba(255,255,255,0.7));
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(118,60,172,0.3);
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .ag__tab:hover {
          background: rgba(118,60,172,0.15);
          border-color: rgba(118,60,172,0.5);
          color: var(--text1, #fff);
        }
        .ag__tab--active {
          background: linear-gradient(135deg, rgba(118,60,172,0.4), rgba(118,60,172,0.2));
          border-color: rgba(118,60,172,0.7);
          color: var(--text1, #fff);
          box-shadow: 0 4px 15px rgba(118,60,172,0.3);
        }
        .ag__empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text2, rgba(255,255,255,0.6));
        }

        @keyframes textShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .ag__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) {
          .ag__grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .ag__grid { grid-template-columns: repeat(2, 1fr); }
        }
        .ag__tile {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
        }

        .ag__border {
          position: absolute; inset: 0;
          padding: 1px; border-radius: 10px;
          background: linear-gradient(180deg, rgba(118,60,172,.5), rgba(118,60,172,.15));
          filter: drop-shadow(0 4px 12px rgba(118,60,172,.15));
          pointer-events: none;
        }

        .ag__imgWrap {
          position: absolute; inset: 0;
          border-radius: 9px; overflow: hidden;
          background: rgba(255,255,255,.03);
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 12px rgba(118,60,172,.15);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .ag__img {
          object-fit: cover;
          transition: transform .4s ease, opacity .3s ease;
        }

        .ag__tile:hover .ag__imgWrap { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(118,60,172,.35); }
        .ag__tile:hover .ag__img { transform: scale(1.05); }

        .ag__shine {
          position: absolute; inset: 0;
          background: linear-gradient(100deg, transparent 10%, rgba(255,255,255,.16) 45%, transparent 60%);
          transform: translateX(-120%); transition: transform .8s ease; mix-blend-mode: screen;
        }
        .ag__tile:hover .ag__shine { transform: translateX(120%); }

        /* Project title overlay */
        .ag__titleOverlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.2rem 0.6rem 0.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          border-radius: 0 0 9px 9px;
          pointer-events: none;
        }
        .ag__projectTitle {
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ag__imageCount {
          display: inline-block;
          margin-top: 0.2rem;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.15);
          padding: 0.1rem 0.35rem;
          border-radius: 20px;
        }

        /* Lightbox */
        .ag__lightbox {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(0,0,0,.92); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
        }
        .ag__lightboxContent {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(1000px, 92vw);
          max-height: 90vh;
        }
        .ag__lightboxImgWrap {
          position: relative;
          width: 100%;
          height: min(70vh, 600px);
          border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(118,60,172,.4);
          box-shadow: 0 16px 50px rgba(118,60,172,.35);
          background: rgba(0,0,0,.6);
        }
        .ag__lightboxImg { object-fit: contain; }

        .ag__projectInfo {
          margin-top: 1rem;
          text-align: center;
          max-width: 600px;
        }
        .ag__projectInfoTitle {
          color: #fff;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
        }
        .ag__projectInfoDesc {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }
        .ag__imageCounter {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .ag__thumbnails {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        .ag__thumbnail {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          background: none;
        }
        .ag__thumbnail--active {
          border-color: rgba(118,60,172,0.8);
          box-shadow: 0 0 10px rgba(118,60,172,0.5);
        }
        .ag__thumbnail:hover {
          border-color: rgba(118,60,172,0.5);
        }

        .ag__close {
          position: absolute; top: 18px; right: 20px;
          font-size: 18px; padding: .4rem .6rem; border-radius: 10px;
          color: var(--text1); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
          cursor: pointer;
          z-index: 10;
        }
        .ag__nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          font-size: 36px; padding: .2rem .6rem; border-radius: 12px;
          color: var(--text1); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
          cursor: pointer;
          z-index: 10;
        }
        .ag__nav--prev { left: 24px; }
        .ag__nav--next { right: 24px; }

        @media (max-width: 640px) {
          .ag__nav { font-size: 28px; padding: .3rem .5rem; }
          .ag__nav--prev { left: 10px; }
          .ag__nav--next { right: 10px; }
          .ag__thumbnail { width: 40px; height: 40px; }
        }
      `}</style>
    </section>
  );
}
