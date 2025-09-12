"use client";
import { useEffect } from "react";
import gsap from "gsap";

export default function LoginPage() {
  useEffect(() => {
    // Animation for the purple circle
    gsap.to(".purple-circle", {
      x: "80vw",
      y: "80vh",
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

  }, []);

  return (
    <div className="login-container h-screen w-full bg-gradient-to-br from-[#763cac] to-[#000000] flex justify-center items-center relative overflow-hidden">
      {/* Animated purple circle */}
      {/* <div className="purple-circle absolute bg-purple-600 rounded-full h-64 w-64 opacity-40 z-0"></div> */}

      <div className="w-full max-w-md p-10 bg-[rgba(0,0,0,0.4)] backdrop-blur-md liquid-glass rounded-xl shadow-2xl border border-[#763cac] z-10">
        <h2 className="text-[var(--text1)] text-3xl font-semibold text-center mb-6">Login to Your Account</h2>
        <p className="text-[var(--text1)] text-lg text-center mb-8">
          Enter your credentials to access your account.
        </p>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[var(--text1)] text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-4 mt-2 rounded-lg bg-[rgba(255,255,255,0.2)] text-[var(--text1)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#763cac] transition duration-300"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[var(--text1)] text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-4 mt-2 rounded-lg bg-[rgba(255,255,255,0.2)] text-[var(--text1)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#763cac] transition duration-300"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" name="remember" className="h-4 w-4 text-[#763cac] border-gray-300 rounded" />
              <label htmlFor="remember" className="text-[var(--text1)] text-sm ml-2">Remember me</label>
            </div>

            <a href="#" className="text-[#763cac] text-sm hover:underline">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            className="login-btn w-full py-3 mt-6 bg-[#763cac] text-[var(--text1)] rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}
