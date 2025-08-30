"use client";
import {  useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import InteractiveBg from "./scripts/bg";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
          snap: 1 / (panels.length - 1),
          end: () => services_container.current ? `+=${services_container.current.offsetWidth}` : "+=0",
          },
      });
  }, []);
  
  
  return (
    <div>
      {/* Home Section 1 */}
      <div className="home_section1 w-full h-screen grid grid-cols-1 md:grid-cols-2 overflow-x-hidden">
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
          <p className="home_section1_heading text-7xl md:text-6xl lg:text-9xl">VISIONARA</p>
          <p className="home_section1_text text-lg md:text-2xl text-center md:text-right w-120">Turn your visions into reality</p>
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
      <div ref={services_container} className="home_section2 w-full mb-30 h-[100vh] overflow-x-hidden">
        <h2 className="text-white text-5xl lg:text-6xl text-center mt-30">Our Services</h2>

        <div className="services_container pr-50 md:pr-0">
          <div className="services_inner">
            <Image
              src="/icons/computer.gif"
              height={150}
              width={150}
              alt="coomputer_icon"
            />
            <h2 className="text-3xl">Web Development</h2>
            <p className="text-md w-[90vw] md:w-[30rem]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, fuga. Ab nostrum dolore quod commodi sed aspernatur magni, quo unde sunt nulla est fuga voluptate perspiciatis iusto officia deleniti similique impedit eos quaerat nemo explicabo veritatis. Fugit corrupti deleniti similique aspernatur, repudiandae, eaque ut in vero ad repellendus, dolores quae.</p>
            <div className="floor floor1"></div>
          </div>

          <div className="services_inner">
            <Image
              src="/icons/computer.gif"
              height={150}
              width={150}
              alt="coomputer_icon"
            />
            <h2 className="text-3xl">Moobile App Development</h2>
            <p className="text-md w-[90vw] md:w-[30rem]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, fuga. Ab nostrum dolore quod commodi sed aspernatur magni, quo unde sunt nulla est fuga voluptate perspiciatis iusto officia deleniti similique impedit eos quaerat nemo explicabo veritatis. Fugit corrupti deleniti similique aspernatur, repudiandae, eaque ut in vero ad repellendus, dolores quae.</p>
            <div className="floor floor2"></div>
          </div>

          <div className="services_inner">
            <Image
              src="/icons/computer.gif"
              height={150}
              width={150}
              alt="coomputer_icon"
            />
            <h2 className="text-3xl">Graphic Designing</h2>
            <p className="text-md w-[90vw] md:w-[30rem]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, fuga. Ab nostrum dolore quod commodi sed aspernatur magni, quo unde sunt nulla est fuga voluptate perspiciatis iusto officia deleniti similique impedit eos quaerat nemo explicabo veritatis. Fugit corrupti deleniti similique aspernatur, repudiandae, eaque ut in vero ad repellendus, dolores quae.</p>
            <div className="floor floor3"></div>
          </div>

          <div className="services_inner">
            <Image
              src="/icons/computer.gif"
              height={150}
              width={150}
              alt="coomputer_icon"
            />
            <h2 className="text-3xl">Marketing</h2>
            <p className="text-md w-[90vw] md:w-[30rem]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, fuga. Ab nostrum dolore quod commodi sed aspernatur magni, quo unde sunt nulla est fuga voluptate perspiciatis iusto officia deleniti similique impedit eos quaerat nemo explicabo veritatis. Fugit corrupti deleniti similique aspernatur, repudiandae, eaque ut in vero ad repellendus, dolores quae.</p>
            <div className="floor floor4"></div>
          </div>

        </div>

      </div>

      <div className="home_section3 w-[80vh] h-fit">
          <h2>Our Acheivements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ml-auto mr-auto">
            <div>

            </div>
          </div>
      </div>

      <InteractiveBg />
    </div>
    
  );
}
