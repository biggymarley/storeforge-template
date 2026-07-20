import type { ContentConfig } from "@/lib/types/config";

export const contentConfig: ContentConfig = {
  testimonials: [
    {
      name: "Sarah M.",
      quote:
        "I'm blown away by the quality and style of the clothes I received. Every piece I've bought has exceeded my expectations.",
      rating: 5,
      verified: true
    },
    {
      name: "Alex K.",
      quote:
        "Finding pieces that align with my personal style used to be a challenge. The range of options offered here is truly remarkable.",
      rating: 5,
      verified: true
    },
    {
      name: "James L.",
      quote:
        "As someone always on the lookout for unique pieces, I'm thrilled to have stumbled upon this store. The selection is on-point with the latest trends.",
      rating: 5,
      verified: true
    }
  ],
  brands: [],
  productReviews: {},
  productFaqs: {},
  faqs: [
    {
      question: "How long does shipping take?",
      answer: "Most orders ship within a few business days and arrive within a week, depending on your location."
    },
    {
      question: "What's your return policy?",
      answer: "We offer free returns within our standard return window — see our Refund Policy page for details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay at checkout."
    },
    {
      question: "How can I track my order?",
      answer: "You'll receive a shipping confirmation email with tracking information as soon as your order ships."
    }
  ],
  // Store adds their own customer/lifestyle photos here (public/branding/gallery/*).
  gallery: [
    { image: "/branding/gallery/gallery-1.png", alt: "Customer riding a scooter in front of a hand-woven rug" },
    { image: "/branding/gallery/gallery-2.jpg", alt: "Rooftop lounge seating overlooking the coast" },
    { image: "/branding/gallery/gallery-3.jpg", alt: "String-lit rooftop dinner table set at dusk" },
    { image: "/branding/gallery/gallery-4.jpg", alt: "Group of customers at an outdoor yoga session" },
    { image: "/branding/gallery/gallery-5.webp", alt: "Cozy bedroom styled with woven textiles" }
  ]
};
