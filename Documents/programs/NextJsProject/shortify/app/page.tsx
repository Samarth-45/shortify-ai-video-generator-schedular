import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Video,
  Calendar,
  Youtube,
  Instagram,
  Mail,
  Sparkles,
  Clock,
  BarChart3,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  Star,
  Globe,
  Shield,
  HeartHandshake,
} from "lucide-react";

/* ───────────────────────── NAVBAR ───────────────────────── */
function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Shortify
          </span>
        </div>

        {/* Links */}
        <div className="hidden items-center gap-8 md:flex">
          {["Features", "How It Works", "Pricing"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-white/5"
          >
            Sign In
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/25">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ───────────────────────── HERO ───────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
      {/* Animated background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/20 blur-[120px] animate-pulse-glow stagger-2" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px] animate-pulse-glow stagger-4" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Pill badge */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Video Generation</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* Heading */}
        <h1 className="animate-fade-in-up stagger-1 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
          Create & Schedule
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-gradient-shift">
            Short Videos
          </span>
          <br />
          with AI in Seconds
        </h1>

        {/* Sub-text */}
        <p className="animate-fade-in-up stagger-2 mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
          Shortify uses cutting-edge AI to generate engaging short-form videos
          for{" "}
          <span className="text-white font-medium">YouTube</span>,{" "}
          <span className="text-white font-medium">Instagram</span>, and{" "}
          <span className="text-white font-medium">Email</span> — then
          auto-schedules them so you never miss a post.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up stagger-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-12 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/25 text-base"
          >
            Start Creating Free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 border-zinc-700 bg-white/5 text-white hover:bg-white/10 hover:text-white text-base"
          >
            <Play className="mr-1 h-4 w-4" />
            Watch Demo
          </Button>
        </div>

        {/* Social proof */}
        <div className="animate-fade-in-up stagger-4 mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          <div className="flex -space-x-2">
            {[
              "bg-gradient-to-br from-violet-400 to-fuchsia-400",
              "bg-gradient-to-br from-blue-400 to-cyan-400",
              "bg-gradient-to-br from-emerald-400 to-teal-400",
              "bg-gradient-to-br from-amber-400 to-orange-400",
              "bg-gradient-to-br from-pink-400 to-rose-400",
            ].map((gradient, i) => (
              <div
                key={i}
                className={`h-9 w-9 rounded-full ${gradient} ring-2 ring-black flex items-center justify-center text-xs font-bold text-white`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-1">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
            </div>
            <p className="text-sm text-zinc-500">
              Loved by{" "}
              <span className="text-white font-medium">2,500+</span> creators
            </p>
          </div>
        </div>

        {/* Platform icons */}
        <div className="animate-fade-in-up stagger-5 mt-16 flex items-center justify-center gap-8 text-zinc-600">
          <div className="flex items-center gap-2 transition-colors hover:text-red-500">
            <Youtube className="h-6 w-6" />
            <span className="text-sm font-medium hidden sm:inline">
              YouTube
            </span>
          </div>
          <div className="flex items-center gap-2 transition-colors hover:text-pink-500">
            <Instagram className="h-6 w-6" />
            <span className="text-sm font-medium hidden sm:inline">
              Instagram
            </span>
          </div>
          <div className="flex items-center gap-2 transition-colors hover:text-blue-400">
            <Mail className="h-6 w-6" />
            <span className="text-sm font-medium hidden sm:inline">
              Email
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

/* ──────────────────── FEATURES ──────────────────── */
const features = [
  {
    icon: <Video className="h-6 w-6" />,
    title: "AI Video Generation",
    description:
      "Generate scroll-stopping short videos from a single text prompt. Our AI crafts visuals, voiceovers, and captions automatically.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Smart Auto-Scheduling",
    description:
      "Set it and forget it. Shortify intelligently schedules posts at peak engagement times across all your platforms.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Multi-Platform Publishing",
    description:
      "Publish simultaneously to YouTube Shorts, Instagram Reels, and email newsletters — all from one dashboard.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics & Insights",
    description:
      "Track video performance across platforms with a unified analytics dashboard. Know what resonates with your audience.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Batch Content Creation",
    description:
      "Create a week's worth of content in minutes. Queue up topics and let Shortify generate and schedule them all.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Custom Branding",
    description:
      "Apply your brand colors, logos, fonts, and watermarks automatically to every video for consistent brand identity.",
    gradient: "from-pink-500 to-rose-500",
  },
];

function Features() {
  return (
    <section id="features" className="relative bg-black py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/10">
            Features
          </Badge>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Go Viral
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            From AI-powered video creation to automated scheduling, Shortify
            provides the complete toolkit for content creators.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/80 hover:-translate-y-1"
            >
              {/* Hover glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`}
              />
              <CardHeader>
                <div
                  className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                >
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-lg">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── HOW IT WORKS ─────────────────── */
const steps = [
  {
    step: "01",
    title: "Enter Your Topic",
    description:
      "Type a topic, paste a script, or describe the video you want. Our AI understands context and creative direction.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    step: "02",
    title: "AI Generates Your Video",
    description:
      "In seconds, Shortify creates a polished short video complete with visuals, transitions, voiceover, and captions.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    step: "03",
    title: "Review & Customize",
    description:
      "Fine-tune your video with our intuitive editor. Adjust timing, swap visuals, edit text, or regenerate sections.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    step: "04",
    title: "Auto-Schedule & Publish",
    description:
      "Choose your platforms, set a schedule or let AI pick the best times, and watch your content go live automatically.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-black py-28">
      {/* Subtle gradient bg */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/10">
            How It Works
          </Badge>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            From Idea to Published in
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line for larger screens */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+30px)] right-[-calc(50%-30px)] h-px w-full bg-gradient-to-r from-zinc-700 to-transparent" />
              )}
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white text-2xl font-bold shadow-lg shadow-violet-500/10 transition-transform duration-300 group-hover:scale-110`}
                >
                  {step.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── PRICING ──────────────────── */
const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying out Shortify",
    features: [
      "5 AI videos / month",
      "720p video quality",
      "1 social account",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-zinc-600 to-zinc-500",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For serious content creators",
    features: [
      "50 AI videos / month",
      "1080p video quality",
      "5 social accounts",
      "Advanced analytics",
      "Auto-scheduling",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    name: "Business",
    price: "$49",
    period: "/mo",
    description: "For teams and agencies",
    features: [
      "Unlimited AI videos",
      "4K video quality",
      "Unlimited accounts",
      "Team collaboration",
      "API access",
      "White-label options",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-blue-600 to-cyan-600",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative bg-black py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Simple, Transparent
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative overflow-hidden border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${plan.popular
                  ? "border-violet-500/30 shadow-lg shadow-violet-500/10 scale-105"
                  : ""
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-zinc-500">{plan.period}</span>
                  )}
                </div>
                <Separator className="bg-zinc-800" />
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/25"
                      : "bg-zinc-800 text-white hover:bg-zinc-700 border-0"
                    }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── CTA SECTION ──────────────────── */
function CTASection() {
  return (
    <section className="relative bg-black py-28 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Ready to Supercharge
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Your Content?
          </span>
        </h2>
        <p className="mt-6 text-lg text-zinc-400">
          Join thousands of creators who are saving hours every week with
          AI-powered video generation and automated scheduling.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-14 px-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/25 text-base"
          >
            Get Started for Free
            <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          No credit card required · Free plan available · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ──────────────────── FOOTER ──────────────────── */
function Footer() {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Changelog", href: "#" },
      { label: "API Docs", href: "#" },
    ],
    Platforms: [
      { label: "YouTube Shorts", href: "#" },
      { label: "Instagram Reels", href: "#" },
      { label: "Email Campaigns", href: "#" },
      { label: "TikTok (Coming Soon)", href: "#" },
    ],
    Company: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Top section */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Shortify</span>
            </div>
            <p className="max-w-xs text-sm text-zinc-500 leading-relaxed">
              AI-powered short video generation and auto-scheduling for YouTube,
              Instagram, and Email. Create content that captivates.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex items-center gap-4">
              {[
                { icon: <Youtube className="h-5 w-5" />, hover: "hover:text-red-500" },
                { icon: <Instagram className="h-5 w-5" />, hover: "hover:text-pink-500" },
                { icon: <Globe className="h-5 w-5" />, hover: "hover:text-blue-400" },
                { icon: <Mail className="h-5 w-5" />, hover: "hover:text-emerald-400" },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className={`text-zinc-600 transition-colors ${social.hover}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Shortify. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Shield className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <HeartHandshake className="h-4 w-4" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────── MAIN PAGE ──────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}
