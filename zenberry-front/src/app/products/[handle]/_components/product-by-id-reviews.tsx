"use client";

import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { MOCK_REVIEWS } from "@/src/data/mock-reviews";

export function ProductByIdReviews() {
  const [sortBy, setSortBy] = useState("Most Relevant");

  const totalReviews = 937;
  const averageRating = 4.6;
  const RATING_DISTRIBUTION = [
    { stars: 5, count: 709 },
    { stars: 4, count: 138 },
    { stars: 3, count: 66 },
    { stars: 2, count: 12 },
    { stars: 1, count: 12 },
  ];

  const sortOptions = [
    "Most Relevant",
    "Most Recent",
    "Highest Rating",
    "Lowest Rating",
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "fill-[#8B53FE] text-theme-accent-tertiary"
            : i < rating
            ? "fill-[#8B53FE] text-theme-accent-tertiary opacity-50"
            : "fill-none text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="my-16">
      {/* Rating Summary */}
      <div className="rounded-xl p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Average Rating */}
          <div className="grid grid-rows-2 md:border-r pr-6">
            <div className="flex items-center justify-center md:justify-end gap-5">
              <div className="text-5xl font-bold text-[#2D5F4F] mb-2">
                {averageRating}
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                  {renderStars(averageRating)}
                </div>
                <p className="text-sm text-theme-text-secondary">
                  Based on {totalReviews} reviews
                </p>
              </div>
            </div>
            <div className="flex justify-center md:justify-end items-center">
              <Button className="bg-theme-accent-primary w-full max-w-56 text-black hover:bg-theme-accent-primary/90">
                See Reviews Summary
              </Button>
            </div>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {RATING_DISTRIBUTION.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="w-4 h-4 fill-[#8B53FE] text-theme-accent-tertiary" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2D5F4F]"
                    style={{
                      width: `${(item.count / totalReviews) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-theme-text-secondary w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
          <div className="h-full flex md:border-l items-center justify-center md:pl-6 md:justify-start ">
            <Button className="bg-theme-accent-primary px-8 text-black hover:bg-theme-accent-primary/90">
              Write a Review
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#2D5F4F]">Reviews</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-theme-text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex items-center rounded-lg hover:bg-gray-50 transition-colors bg-transparent border border-gray-300 py-1.5 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-8 border-t border-theme-text-secondary/20 pt-8">
        {MOCK_REVIEWS.map((review, index) => (
          <div
            key={review.id}
            className={`${
              index !== 0 ? "border-t border-theme-text-secondary/10 pt-8" : ""
            }`}
          >
            {/* Review Header */}
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-[25%_65%_10%] lg:grid-cols-[25%_50%_25%]">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <span className="text-xl font-semibold text-gray-600">
                      {review.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-theme-text-primary">
                        {review.author}
                      </h4>
                    </div>
                    {review.verified && (
                      <span className="flex items-start text-theme-accent-tertiary mb-2">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                  <div className="flex justify-between gap-5">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-semibold text-theme-text-primary">
                      {review.title}
                    </span>
                  </div>
                  {/* Review Content */}
                  <p className="text-theme-text-primary mb-4 leading-relaxed">
                    {review.content}
                  </p>
                  {/* Zenberry Response */}
                  {review.zenberryResponse && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-theme-accent-tertiary flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            Z
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-theme-text-primary">
                          {review.zenberryResponse.author}
                        </span>
                      </div>
                      <p className="text-sm text-theme-text-primary">
                        {review.zenberryResponse.content}
                      </p>
                    </div>
                  )}
                </div>
                <span className="text-sm text-theme-text-secondary text-end shrink-0">
                  {review.date}
                </span>
              </div>
            </div>

            {/* Helpful Actions */}
            <div className="flex items-center justify-end gap-4 text-sm ml-16">
              <span className="text-theme-text-secondary">
                What this review helpful?
              </span>
              <button className="flex items-center gap-1 text-theme-text-secondary hover:text-theme-accent-secondary transition-colors">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-theme-text-secondary hover:text-red-500 transition-colors">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
