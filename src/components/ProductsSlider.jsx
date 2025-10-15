"use client";

import { useRef } from "react";
import ProductCard from "@/components/ProductCard";

const ChevronLeftIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {" "}
    <path d="m15 18-6-6 6-6" />{" "}
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {" "}
    <path d="m9 18 6-6-6-6" />{" "}
  </svg>
);

export default function ProductsSlider({ products, title }) {
  const scrollContainerRef = useRef(null);
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      {" "}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>{" "}
      <div className="relative">
        {" "}
        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[calc(50%-0.5rem)] md:auto-cols-[calc(33.33%-0.66rem)] lg:auto-cols-[calc(25%-0.75rem)] gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {" "}
          {products.map((product) => (
            <div key={product.id} className="snap-start">
              {" "}
              <ProductCard product={product} />{" "}
            </div>
          ))}{" "}
        </div>{" "}
        <button
          onClick={scrollLeft}
          aria-label="Scroll Left"
          className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          {" "}
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />{" "}
        </button>{" "}
        <button
          onClick={scrollRight}
          aria-label="Scroll Right"
          className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          {" "}
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />{" "}
        </button>{" "}
      </div>{" "}
    </section>
  );
}
