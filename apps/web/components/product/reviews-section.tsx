"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductReviews, useReviewsStore } from "@/lib/reviews-store";
import { cn } from "cn";

const reviewSchema = z.object({
  authorName: z.string().min(2, "Enter your name"),
  title: z.string().min(2, "Give your review a title"),
  body: z.string().min(10, "Share a few more details (10+ characters)"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function StarPicker({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-label={`Rate ${value} out of 5 stars`}
            className="p-0.5"
          >
            <Star className={cn("size-5", value <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewsSection({ productId }: { productId: number }) {
  const reviews = useProductReviews(productId);
  const addReview = useReviewsStore((state) => state.addReview);
  const [rating, setRating] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema) });

  function onSubmit(values: ReviewFormValues) {
    addReview({
      id: crypto.randomUUID(),
      productId,
      rating,
      createdAt: new Date().toISOString(),
      ...values,
    });
    toast.success("Thanks for your review!");
    reset();
    setRating(5);
    setShowForm(false);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your experience.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-border pb-5 last:border-0">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("size-3.5", i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{review.title}</span>
              </div>
              <p className="mb-1 text-sm text-muted-foreground">{review.body}</p>
              <p className="text-xs text-muted-foreground">
                {review.authorName} ·{" "}
                {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border border-border p-4">
          <Field>
            <FieldLabel>Your rating</FieldLabel>
            <StarPicker rating={rating} onChange={setRating} />
          </Field>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="review-name">Name</FieldLabel>
              <Input id="review-name" {...register("authorName")} aria-invalid={!!errors.authorName} />
              <FieldError errors={[errors.authorName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="review-title">Review title</FieldLabel>
              <Input id="review-title" {...register("title")} aria-invalid={!!errors.title} />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="review-body">Review</FieldLabel>
              <Textarea id="review-body" rows={4} {...register("body")} aria-invalid={!!errors.body} />
              <FieldError errors={[errors.body]} />
            </Field>
          </FieldGroup>
          <div className="flex gap-2">
            <Button type="submit">Submit Review</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" className="w-fit" onClick={() => setShowForm(true)}>
          Write a Review
        </Button>
      )}
    </div>
  );
}
