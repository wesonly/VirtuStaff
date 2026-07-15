import { useState, useEffect, useRef } from "react";

// ─── Logo ────────────────────────────────────────────────────────────────────

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" className="fill-indigo-600 dark:fill-indigo-500" />
      <path
        d="M8 20V8h3.5l3.5 5.5L18.5 8H22v12h-3.5v-6.5L15.5 19h-1l-3-5.5V20H8z"
        fill="white"
      />
    </svg>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg dark:border-gray-800/60 dark:bg-gray-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight">VirtuStaff</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Home
          </a>
          <a href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            How It Works
          </a>
          <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Features
          </a>
          <a href="/#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Pricing
          </a>
          <a href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Blog
          </a>
          <a
            href="/#waitlist"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-md active:scale-[0.97]"
          >
            Get Early Access
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 md:hidden">
          <div className="flex flex-col gap-3 px-6 py-5">
            <a href="/" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Home
            </a>
            <a href="/#how-it-works" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              How It Works
            </a>
            <a href="/#features" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Features
            </a>
            <a href="/#pricing" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Pricing
            </a>
            <a href="/blog" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Blog
            </a>
            <a
              href="/#waitlist"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              Get Early Access
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-bold tracking-tight">VirtuStaff</span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Your AI Workforce. Replace the cost and hassle of hiring with
              specialized AI employees that work 24/7.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-3">
              <li><a href="/#features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Features</a></li>
              <li><a href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Pricing</a></li>
              <li><a href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">How It Works</a></li>
              <li><a href="/#waitlist" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Early Access</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-3">
              <li><a href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">About</a></li>
              <li><a href="/blog" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Blog</a></li>
              <li><span className="text-sm text-gray-600 dark:text-gray-400">Careers</span></li>
              <li><span className="text-sm text-gray-600 dark:text-gray-400">Contact</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-3">
              <li><a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} VirtuStaff. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page wrapper ────────────────────────────────────────────────────────────

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

// ─── FadeIn (scroll animation) ───────────────────────────────────────────────

export function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
        ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}),
      }}
    >
      {children}
    </div>
  );
}