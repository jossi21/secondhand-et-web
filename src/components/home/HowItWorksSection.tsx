"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  ShoppingBag,
  Users,
  ShieldCheck,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  CreditCard,
  Smartphone,
  Globe,
  Award,
} from "lucide-react";
import Link from "next/link";

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  step: number;
  delay?: number;
}

function StepCard({
  icon: Icon,
  title,
  description,
  step,
  delay = 0,
}: StepCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            delay: delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className="group relative rounded-2xl border border-border bg-white p-6 transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-white shadow-lg">
        {step}
      </div>

      <div className="relative">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-terracotta-tint text-terracotta transition-transform group-hover:scale-110 group-hover:rotate-3">
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="mb-2 font-display text-lg font-semibold text-ink">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">{description}</p>

        <div className="mt-4 h-0.5 w-12 rounded-full bg-terracotta/30 transition-all group-hover:w-20 group-hover:bg-terracotta" />
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay: delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-cream-dim hover:scale-[1.02]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta transition-all group-hover:bg-terracotta group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-medium text-ink">{title}</h4>
        <p className="text-sm text-ink-soft">{description}</p>
      </div>
    </motion.div>
  );
}

interface HowItWorksSectionProps {
  stats?: {
    activeListings: number;
    soldListings: number;
    citiesCovered: number;
    verifiedSellers: number;
  };
}

export default function HowItWorksSection({ stats }: HowItWorksSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const steps = [
    {
      icon: Smartphone,
      title: "Create Your Account",
      description:
        "Sign up in seconds as a buyer or seller. Choose your role and start exploring the marketplace tailored to you.",
    },
    {
      icon: ShoppingBag,
      title: "List or Browse Items",
      description:
        "Sellers can list items with photos and prices. Buyers can browse thousands of listings across Ethiopia.",
    },
    {
      icon: MessageSquare,
      title: "Connect & Negotiate",
      description:
        "Chat directly with sellers through Telegram, WhatsApp, or phone. Negotiate prices and arrange meetups.",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Secure Transactions",
      description:
        "All sellers are verified. Our rating system helps you trust who you're dealing with. Report any issues instantly.",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Local Marketplace",
      description:
        "Buy and sell within your city. Meet locally for safer transactions.",
    },
    {
      icon: CreditCard,
      title: "Fair Pricing",
      description: "No hidden fees. Sellers keep 100% of their earnings.",
    },
    {
      icon: Star,
      title: "Rating System",
      description:
        "Rate sellers after every purchase. Build trust in the community.",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description:
        "List or browse anytime, anywhere. Your marketplace never sleeps.",
    },
    {
      icon: Globe,
      title: "Ethiopia-Wide",
      description:
        "From Addis Ababa to sub cities, connect with buyers and sellers across the country.",
    },
    {
      icon: Award,
      title: "Verified Sellers",
      description:
        "Check for verified badges. Know you're dealing with trusted sellers.",
    },
  ];

  // Use real stats from props or fallback to defaults
  const displayStats = {
    activeListings: stats?.activeListings ?? 0,
    soldListings: stats?.soldListings ?? 0,
    citiesCovered: stats?.citiesCovered ?? 0,
    verifiedSellers: stats?.verifiedSellers ?? 0,
  };

  const statItems = [
    {
      label: "Active Listings",
      value: displayStats.activeListings.toLocaleString(),
    },
    {
      label: "Verified Sellers",
      value: displayStats.verifiedSellers.toLocaleString(),
    },
    {
      label: "Cities Covered",
      value: displayStats.citiesCovered.toLocaleString(),
    },
    {
      label: "Transactions",
      value: displayStats.soldListings.toLocaleString(),
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Header */}
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-terracotta-tint px-4 py-1.5 text-sm font-medium text-terracotta mb-4">
          <TrendingUp className="h-4 w-4" />
          How It Works
        </div>
        <h2 className="font-display text-4xl font-bold text-ink">
          Start Selling or Buying on{" "}
          <span className="text-terracotta">SecondHand ET</span>
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Join Ethiopia&apos;s trusted marketplace for secondhand goods.
          Here&apos;s how easy it is to get started.
        </p>
      </motion.div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <StepCard
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            step={index + 1}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={controls}
        variants={{
          hidden: { scaleX: 0 },
          visible: {
            scaleX: 1,
            transition: { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        className="h-px bg-gradient-to-r from-transparent via-terracotta/30 to-transparent"
      />

      {/* Features Section */}
      <motion.div
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 },
          },
        }}
        className="space-y-8"
      >
        <div className="text-center">
          <h3 className="font-display text-2xl font-semibold text-ink">
            Why Choose <span className="text-terracotta">SecondHand ET</span>
          </h3>
          <p className="mt-2 text-ink-soft">
            Built for Ethiopians, by Ethiopians. Here&apos;s what makes us
            different.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.05}
            />
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta to-terracotta-dark p-8 text-center text-white md:p-12"
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative">
          <h3 className="font-display text-2xl font-bold md:text-3xl">
            Ready to get started?
          </h3>
          <p className="mt-2 text-white/80 max-w-xl mx-auto">
            Join thousands of Ethiopians already buying and selling on
            SecondHand ET.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/listings/new"
              className="rounded-full bg-white px-8 py-3 font-semibold text-terracotta transition-all hover:scale-105 hover:shadow-lg"
            >
              Get Started Now
            </Link>
            <Link
              href="/browse"
              className="rounded-full border-2 border-white/30 px-8 py-3 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/50"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Section - Using Real Data */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.6, delay: 0.6 },
          },
        }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-white p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <p className="font-mono-data text-2xl font-bold text-terracotta">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
