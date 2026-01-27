'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function PortfolioPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter projects based on active tab
  const filteredProjects = activeTab === 'all'
    ? projects
    : projects.filter(p => p.serviceId === activeTab);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, servicesResponse] = await Promise.all([
          fetch('/api/projects?limit=50'),
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

      gsap.from('.portfolio__header .reveal', {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });

      gsap.from('.portfolio__tile', {
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

    const tiles = document.querySelectorAll('.portfolio__tile');
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

  // Get all images for selected project
  const getAllProjectImages = (project: Project): { url: string; alt: string }[] => {
    const allImages: { url: string; alt: string }[] = [
      { url: project.coverImage, alt: project.title }
    ];
    if (project.images && project.images.length > 0) {
      project.images.forEach(img => {
        allImages.push({ url: img.imageUrl, alt: img.alt });
      });
    }
    return allImages;
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!selectedProject) return;
    const images = getAllProjectImages(selectedProject);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!selectedProject) return;
    const images = getAllProjectImages(selectedProject);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <main className="portfolio">
        <div className="portfolio__container">
          <header className="portfolio__header">
            <h1>
              <span className="portfolio__headlineFill">Our Portfolio</span>
            </h1>
            <p className="portfolio__sub">Loading our projects...</p>
          </header>
          <div className="portfolio__grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="portfolio__tile animate-pulse">
                <div className="portfolio__imgWrap">
                  <div className="h-full bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style jsx>{portfolioStyles}</style>
      </main>
    );
  }

  return (
    <main ref={ref} className="portfolio">
      <div className="portfolio__container">
        <header className="portfolio__header">
          <h1 className="reveal">
            <span className="portfolio__headlineFill">Our Portfolio</span>
          </h1>
          <p className="portfolio__sub reveal">
            Explore our complete collection of work across all services.
          </p>
        </header>

        {/* Service Tabs */}
        <div className="portfolio__tabs">
          <button
            className={`portfolio__tab ${activeTab === 'all' ? 'portfolio__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({projects.length})
          </button>
          {services.map((service) => {
            const count = projects.filter(p => p.serviceId === service.id).length;
            return (
              <button
                key={service.id}
                className={`portfolio__tab ${activeTab === service.id ? 'portfolio__tab--active' : ''}`}
                onClick={() => setActiveTab(service.id)}
              >
                {service.title} ({count})
              </button>
            );
          })}
        </div>

        <div className="portfolio__grid">
          {filteredProjects.length === 0 ? (
            <div className="portfolio__empty">
              <p>No projects found for this category.</p>
            </div>
          ) : filteredProjects.map((project) => (
            <figure
              key={project.id}
              className="portfolio__tile"
              role="button"
              tabIndex={0}
              aria-label={`View ${project.title}`}
              onClick={() => openProject(project)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openProject(project)}
            >
              <span className="portfolio__border" aria-hidden />
              <div className="portfolio__imgWrap">
                <Image
                  fill
                  src={project.coverImage}
                  alt={project.title}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
                  className="portfolio__img"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <span className="portfolio__shine" aria-hidden />
              </div>
              {/* Project title overlay */}
              <div className="portfolio__titleOverlay">
                <h3 className="portfolio__projectTitle">{project.title}</h3>
                {project.service && (
                  <span className="portfolio__serviceTag">{project.service.title}</span>
                )}
                {project.images && project.images.length > 0 && (
                  <span className="portfolio__imageCount">{project.images.length + 1} images</span>
                )}
              </div>
            </figure>
          ))}
        </div>
      </div>

      {/* Project Lightbox */}
      {selectedProject && (
        <div className="portfolio__lightbox" role="dialog" aria-modal="true" aria-label="Project viewer">
          <button className="portfolio__close" aria-label="Close" onClick={closeProject}>✕</button>

          {getAllProjectImages(selectedProject).length > 1 && (
            <>
              <button
                className="portfolio__nav portfolio__nav--prev"
                aria-label="Previous"
                onClick={prevImage}
              >‹</button>
              <button
                className="portfolio__nav portfolio__nav--next"
                aria-label="Next"
                onClick={nextImage}
              >›</button>
            </>
          )}

          <div className="portfolio__lightboxContent">
            <div className="portfolio__lightboxImgWrap">
              <Image
                key={currentImageIndex}
                fill
                src={getAllProjectImages(selectedProject)[currentImageIndex]?.url}
                alt={getAllProjectImages(selectedProject)[currentImageIndex]?.alt}
                sizes="100vw"
                className="portfolio__lightboxImg"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>

            {/* Project Info */}
            <div className="portfolio__projectInfo">
              <h3 className="portfolio__projectInfoTitle">{selectedProject.title}</h3>
              {selectedProject.service && (
                <span className="portfolio__projectServiceTag">{selectedProject.service.title}</span>
              )}
              {selectedProject.description && (
                <p className="portfolio__projectInfoDesc">{selectedProject.description}</p>
              )}
              {/* Image counter */}
              <div className="portfolio__imageCounter">
                {currentImageIndex + 1} / {getAllProjectImages(selectedProject).length}
              </div>
              {/* Thumbnails */}
              {getAllProjectImages(selectedProject).length > 1 && (
                <div className="portfolio__thumbnails">
                  {getAllProjectImages(selectedProject).map((img, idx) => (
                    <button
                      key={idx}
                      className={`portfolio__thumbnail ${idx === currentImageIndex ? 'portfolio__thumbnail--active' : ''}`}
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

      <style jsx>{portfolioStyles}</style>
    </main>
  );
}

const portfolioStyles = `
  .portfolio {
    min-height: 100vh;
    padding-top: 100px;
    color: var(--text1);
    background:
      radial-gradient(1200px 400px at 10% 20%, rgba(118,60,172,.12), transparent 40%),
      radial-gradient(900px 300px at 90% 80%, rgba(118,60,172,.12), transparent 40%);
  }

  .portfolio__container {
    width: min(1400px, 95vw);
    margin-inline: auto;
    padding: 2rem 0 5rem;
  }

  .portfolio__header { text-align:center; margin-bottom: 2rem; }
  .portfolio__header h1 {
    position: relative;
    display:inline-block;
    font-size: clamp(2rem, 5vw, 3rem);
    line-height:1.1;
    margin:0 0 .5rem;
  }
  .portfolio__headlineFill {
    position: relative;
    display: inline-block;
    background: linear-gradient(110deg, var(--text1), var(--foreground), var(--text1));
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: portfolioTextShine 4s ease-in-out infinite;
  }
  .portfolio__sub { opacity:.8; max-width:640px; margin:0 auto; font-size: 1.1rem; }

  @keyframes portfolioTextShine {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Service Tabs */
  .portfolio__tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2.5rem;
    padding: 0 1rem;
  }
  .portfolio__tab {
    padding: 0.7rem 1.4rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text2, rgba(255,255,255,0.7));
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(118,60,172,0.3);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .portfolio__tab:hover {
    background: rgba(118,60,172,0.15);
    border-color: rgba(118,60,172,0.5);
    color: var(--text1, #fff);
  }
  .portfolio__tab--active {
    background: linear-gradient(135deg, rgba(118,60,172,0.4), rgba(118,60,172,0.2));
    border-color: rgba(118,60,172,0.7);
    color: var(--text1, #fff);
    box-shadow: 0 4px 15px rgba(118,60,172,0.3);
  }

  .portfolio__empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem 1rem;
    color: var(--text2, rgba(255,255,255,0.6));
  }

  .portfolio__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  .portfolio__tile {
    position: relative;
    aspect-ratio: 16 / 10;
    border-radius: 16px;
    cursor: pointer;
    outline: none;
    overflow: hidden;
  }

  .portfolio__border {
    position: absolute; inset: 0;
    padding: 1px; border-radius: 16px;
    background: linear-gradient(180deg, rgba(118,60,172,.5), rgba(118,60,172,.15));
    filter: drop-shadow(0 8px 22px rgba(118,60,172,.25));
    pointer-events: none;
  }

  .portfolio__imgWrap {
    position: absolute; inset: 0;
    border-radius: 15px; overflow: hidden;
    background: rgba(255,255,255,.03);
    backdrop-filter: blur(4px);
    box-shadow: 0 8px 22px rgba(118,60,172,.25);
    transition: transform .25s ease, box-shadow .25s ease;
  }

  .portfolio__img {
    object-fit: cover;
    transition: transform .4s ease, opacity .3s ease;
  }

  .portfolio__tile:hover .portfolio__imgWrap { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(118,60,172,.35); }
  .portfolio__tile:hover .portfolio__img { transform: scale(1.05); }

  .portfolio__shine {
    position: absolute; inset: 0;
    background: linear-gradient(100deg, transparent 10%, rgba(255,255,255,.16) 45%, transparent 60%);
    transform: translateX(-120%); transition: transform .8s ease; mix-blend-mode: screen;
  }
  .portfolio__tile:hover .portfolio__shine { transform: translateX(120%); }

  /* Project title overlay */
  .portfolio__titleOverlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2.5rem 1rem 1rem;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
    border-radius: 0 0 15px 15px;
    pointer-events: none;
  }
  .portfolio__projectTitle {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .portfolio__serviceTag {
    display: inline-block;
    margin-top: 0.4rem;
    margin-right: 0.5rem;
    font-size: 0.75rem;
    color: #fff;
    background: rgba(118,60,172,0.6);
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
  }
  .portfolio__imageCount {
    display: inline-block;
    margin-top: 0.4rem;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.15);
    padding: 0.2rem 0.5rem;
    border-radius: 20px;
  }

  /* Lightbox */
  .portfolio__lightbox {
    position: fixed; inset: 0; z-index: 80;
    background: rgba(0,0,0,.92); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
  }
  .portfolio__lightboxContent {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(1000px, 92vw);
    max-height: 90vh;
  }
  .portfolio__lightboxImgWrap {
    position: relative;
    width: 100%;
    height: min(70vh, 600px);
    border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(118,60,172,.4);
    box-shadow: 0 16px 50px rgba(118,60,172,.35);
    background: rgba(0,0,0,.6);
  }
  .portfolio__lightboxImg { object-fit: contain; }

  .portfolio__projectInfo {
    margin-top: 1rem;
    text-align: center;
    max-width: 600px;
  }
  .portfolio__projectInfoTitle {
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
  }
  .portfolio__projectServiceTag {
    display: inline-block;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #fff;
    background: rgba(118,60,172,0.6);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
  }
  .portfolio__projectInfoDesc {
    color: rgba(255,255,255,0.7);
    font-size: 0.95rem;
    margin: 0.75rem 0;
  }
  .portfolio__imageCounter {
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .portfolio__thumbnails {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  .portfolio__thumbnail {
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
  .portfolio__thumbnail--active {
    border-color: rgba(118,60,172,0.8);
    box-shadow: 0 0 10px rgba(118,60,172,0.5);
  }
  .portfolio__thumbnail:hover {
    border-color: rgba(118,60,172,0.5);
  }

  .portfolio__close {
    position: absolute; top: 18px; right: 20px;
    font-size: 18px; padding: .4rem .6rem; border-radius: 10px;
    color: var(--text1); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
    cursor: pointer;
    z-index: 10;
  }
  .portfolio__nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    font-size: 36px; padding: .2rem .6rem; border-radius: 12px;
    color: var(--text1); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
    cursor: pointer;
    z-index: 10;
  }
  .portfolio__nav--prev { left: 24px; }
  .portfolio__nav--next { right: 24px; }

  @media (max-width: 640px) {
    .portfolio__nav { font-size: 28px; padding: .3rem .5rem; }
    .portfolio__nav--prev { left: 10px; }
    .portfolio__nav--next { right: 10px; }
    .portfolio__thumbnail { width: 40px; height: 40px; }
    .portfolio__grid { grid-template-columns: 1fr; }
  }
`;
