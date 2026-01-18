import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Container } from '@/components/layout';

const footerLinks = {
  platform: [
    { label: 'Browse Properties', href: '/properties' },
    { label: 'For Creators', href: '/creators' },
    { label: 'For Hosts', href: '/hosts' },
    { label: 'How It Works', href: '/how-it-works' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Help Center', href: '/help' },
    { label: 'Creator Guide', href: '/guides/creators' },
    { label: 'Host Guide', href: '/guides/hosts' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'FTC Disclosure', href: '/ftc-disclosure' },
  ],
};

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/creatorstays', icon: Instagram },
  { label: 'Twitter', href: 'https://twitter.com/creatorstays', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/creatorstays', icon: Linkedin },
  { label: 'YouTube', href: 'https://youtube.com/@creatorstays', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-sand-50 border-t border-sand-100">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-xl font-semibold text-gray-900">CreatorStays</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs">
              The marketplace connecting content creators with amazing vacation rentals.
            </p>
            <div className="mt-6 flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-coral-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-coral-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-coral-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-coral-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-coral-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sand-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CreatorStays. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Made with care for creators and hosts everywhere.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
