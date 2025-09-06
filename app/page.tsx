"use client";

import Image from "next/image";
import InteractiveBg from "./scripts/bg";
import Services from "@/components/services";
import Package_detail from "@/components/package";
import ReviewsSection from "@/components/reviews";
import VisionQuoteBand from "@/components/quoate";
import Gallery from "@/components/gallery";

export default function Home() {

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

      {/* Services */}
      
      <Services/>

      {/* Gallery */}
      
      <Gallery />

      {/* Quote */}

      <VisionQuoteBand/>

      {/* Package */}

      <div className="home_section5 w-[70vw] h-fit mt-40 ml-auto mr-auto mb-30">
        <Package_detail />
      </div>

      {/* Review Section */}
      <ReviewsSection />

      <InteractiveBg />
    </div>
    
  );
}
