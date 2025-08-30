"use client";
import {  useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import InteractiveBg from "./scripts/bg";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lordicon from "components/lordicon"; 
export default function Home() {


  const services_container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add GSAP Scroll Trigger
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ ease: "none", duration: 2 });
    }

    // Gsap Time Line 1
    const tl = gsap.timeline({
        scrollTrigger: {
        trigger: ".home_section1",
        start: "top top",
        end: "+=500",
        scrub: true,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
      },
    });

    tl.to(".home_section1", { opacity: 0 }, 0);
    tl.from(".home_section2", { yPercent: 0 }, 0);

  }, []);

  useEffect(() => {
    const panels = gsap.utils.toArray('.services_inner');
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: services_container.current,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          end: () => services_container.current ? `+=${services_container.current.offsetWidth}` : "+=0",
          },
      });
  }, []);
  
  
  return (
    <div>
      {/* Home Section 1 */}
      <div className="home_section1 w-full h-screen grid grid-cols-1 md:grid-cols-2">
        <div className="gradient-bg">
          <svg xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
          <div className="gradients-container">
            <div className="g1"></div>
            <div className="g2"></div>
            <div className="g3"></div>
            <div className="g4"></div>
            <div className="g5"></div>
            <div className="interactive"></div>
          </div>
        </div>  
        <div className=" flex flex-col justify-center items-center order-2 md:order-1 h-fit md:h-full">
          <p className="home_section1_heading text-5xl sm:text-7xl md:text-6xl lg:text-9xl">VISIONARA</p>
          <p className="home_section1_text text-2xl text-right w-120">Turn your visions into reality</p>
        </div>
        <div className="home_section1_right flex justify-center items-center order-1 md:order-2">
          <div className="relative w-[300px] h-[250px] md:w-[500px] md:h-[500px]">
            <Image
              src="/images/just_logo.png"
              alt="visionara_logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Home Section 2 */}
      <div ref={services_container} className="home_section2 w-full mb-30 h-full">
        <h2 className="text-white text-6xl text-center mt-20">Our Services</h2>

        <div className="services_container">
          <div className="services_inner"> 
            <Lordicon/>
            <h2>Web Development</h2>
          </div>

          <div className="services_inner">
            <h2>Mobile Apps</h2>
          </div>

          <div className="services_inner">
            <h2>UI/UX Design</h2>
          </div>

        </div>

      </div>

      <InteractiveBg />
    </div>
    
  );
}
