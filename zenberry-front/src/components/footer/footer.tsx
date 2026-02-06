"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, X } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-theme-accent-secondary py-16 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[230px_auto] gap-8 mb-8">
          {/* Logo and Social Section */}
          <div className="flex flex-col items-center">
            <Image
              src="/logo-zenberry.webp"
              alt="Zenberry"
              width={225}
              height={35}
              className="mb-6 inline-block"
            />

            {/* Social Icons */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href="#"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Facebook className="h-7 w-7" />
              </a>
              <a
                href="#"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Instagram className="h-7 w-7" />
              </a>
              <a
                href="#"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Youtube className="h-7 w-7" />
              </a>
              <a
                href="#"
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="h-7 w-7" />
              </a>
            </div>

            {/* Email Signup */}
            <div>
              <div className="mb-4">
                <p className="text-white w-40 mb-2">
                  Sign up & get 15% off your first purchase.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 text-center sm:grid-cols-3 sm:text-start">
            {/* Discover by Product */}
            <div className="mb-5 md:mb-0">
              <h4 className="font-semibold text-white mb-2">
                discover by product
              </h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition-colors"
                  >
                    all products
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd gummies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd sleep gummies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd tinctures
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd & thc capsules
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd topicals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd for pets
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    mood gummies
                  </a>
                </li>
              </ul>
            </div>
            {/* Discover by Benefits */}
            <div className="mb-5 md:mb-0">
              <h4 className="font-semibold text-white mb-2">
                discover by benefits
              </h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    enjoy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    sleep
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    mood
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    relief
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    relax
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    focus
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    pet
                  </a>
                </li>
              </ul>
            </div>
            {/* Discover by Spectrum */}
            <div>
              <h4 className="font-semibold text-white mb-2">
                discover by spectrum
              </h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd & thc / full spectrum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd / isolate cbd
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    cbd+ / broad spectrum
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-6 space-y-3 text-center text-xs text-white/80">
          <p>
            These statements have not been evaluated by the Food and Drug
            Administration. These products are not intended to diagnose, treat,
            cure, or prevent any disease. Results may vary.
          </p>
          <p>
            The 2018 Agriculture Improvement Act (the &quot;Farm Bill&quot;)
            allows for shipment of hemp-derived products across the United
            States. However, many states have their own laws regarding products
            that contain THC. In certain states these laws may be stricter
            against hemp-derived products that are legal nationwide under the
            Farm Bill. Be sure to check with your state.
          </p>
          <p>
            When you order products from us, you agree that we will not be
            responsible to, and you release us from any claims for any liability
            or losses that you may incur, as a result of the application of
            state or local laws.
          </p>
        </div>
      </div>
    </footer>
  );
}
