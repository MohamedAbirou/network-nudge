import { ArrowRight, CheckCircle, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';

/**
 * Marketing Landing Page
 * Conversion-focused homepage for Network Nudge
 */
export function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: send to Mailchimp, Convertkit, etc.
    console.log('Added to waitlist:', email);
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">Network Nudge</div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </div>
          <a href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
            ✨ LinkedIn's Missing Feature
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Never Miss a Chance to <span className="text-indigo-600">Reconnect</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Network Nudge watches your LinkedIn connections and alerts you at the perfect moment—when someone changes jobs, celebrates an anniversary, or posts something meaningful. Stay top-of-mind without being pushy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="/signup"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 transition"
            >
              Get Started Free <ArrowRight size={20} />
            </a>
            <button
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition"
            >
              See Demo
            </button>
          </div>

          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 rounded-lg shadow-2xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50 p-8">
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Network Nudge Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to stronger professional relationships
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Connect LinkedIn',
                description: 'Securely link your LinkedIn account. Your data stays encrypted and private.',
                icon: '🔐',
              },
              {
                number: '2',
                title: 'Get Smart Nudges',
                description: 'Get personalized alerts when connections have life events or post content.',
                icon: '💡',
              },
              {
                number: '3',
                title: 'Stay Connected',
                description: 'Reach out at the perfect moment. We suggest what to say, you choose the action.',
                icon: '🤝',
              },
            ].map((step) => (
              <div key={step.number} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{step.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                {step.number !== '3' && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-3xl text-indigo-300">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: <Zap className="text-indigo-600" size={24} />,
                title: 'Smart Activity Tracking',
                description: 'Automatically detect job changes, anniversaries, posts, and more from your connections.',
              },
              {
                icon: <TrendingUp className="text-indigo-600" size={24} />,
                title: 'Network Analytics',
                description: 'Visualize your network health. See response rates, engagement trends, and growth.',
              },
              {
                icon: <Shield className="text-indigo-600" size={24} />,
                title: 'Privacy First',
                description: 'Encrypted tokens, GDPR/CCPA compliant, no data sales. Your privacy is sacred.',
              },
              {
                icon: <Users className="text-indigo-600" size={24} />,
                title: 'Team Collaboration',
                description: 'Share insights with your team. Manage roles, shared dashboards, and CSV exports.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade only when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for exploring',
                features: [
                  '5 nudges per month',
                  'Basic analytics',
                  '1st-degree connections',
                  'Email reminders',
                  'Community support',
                ],
                cta: 'Get Started',
                ctaStyle: 'border-2 border-gray-300 text-gray-900',
              },
              {
                name: 'Pro',
                price: '$9',
                period: '/month',
                description: 'For power users',
                features: [
                  'Unlimited nudges',
                  'Advanced analytics',
                  'Custom reminders',
                  'CSV export',
                  'Priority support',
                  '30-day money-back guarantee',
                ],
                cta: 'Start Free Trial',
                ctaStyle: 'bg-indigo-600 text-white',
                featured: true,
              },
              {
                name: 'Team',
                price: '$29',
                period: '/month + $10/seat',
                description: 'For teams & organizations',
                features: [
                  'Everything in Pro',
                  'Unlimited team members',
                  'Shared dashboards',
                  'User roles & permissions',
                  'Team analytics',
                  'Dedicated support',
                  'Custom integrations',
                ],
                cta: 'Start Free Trial',
                ctaStyle: 'border-2 border-gray-300 text-gray-900',
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-lg border-2 p-8 ${
                  plan.featured
                    ? 'border-indigo-600 shadow-xl relative'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 text-sm">{plan.period}</span>}
                </div>
                <button className={`w-full py-3 rounded-lg font-semibold mb-6 transition ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Network Nudge helped me land my current role by keeping me connected with my network.",
                author: 'Sarah M.',
                role: 'Product Manager',
              },
              {
                quote: 'Finally, a tool that respects my privacy while helping me grow my network intentionally.',
                author: 'James P.',
                role: 'Founder',
              },
              {
                quote: 'Our team uses it to stay aligned on important customer relationships. Game-changer.',
                author: 'Maria L.',
                role: 'Sales Director',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Is Network Nudge affiliated with LinkedIn?',
                a: 'No, we are not affiliated with LinkedIn. We are an independent company that integrates with LinkedIn\'s APIs to provide a read-only service.',
              },
              {
                q: 'Does Network Nudge post or message on my behalf?',
                a: 'No, absolutely not. Our app is read-only. You decide when and how to reach out; we just remind you of the perfect moments.',
              },
              {
                q: 'Is my LinkedIn data private?',
                a: 'Yes. Your LinkedIn tokens are encrypted at rest, your connections are never shared with other users, and we never sell your data.',
              },
              {
                q: 'Can I use this for my team?',
                a: 'Yes! Our Team plan ($29/month + $10/seat) includes shared dashboards, user roles, and team-level insights.',
              },
              {
                q: 'Do you offer a refund?',
                a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your first month.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="border border-gray-200 rounded-lg p-6 group cursor-pointer"
              >
                <summary className="font-semibold text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Reconnect Meaningfully?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of professionals who are strengthening their networks with Network Nudge.
          </p>

          <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Get Started
            </button>
          </form>

          {subscribed && (
            <p className="text-green-100">✓ Check your email for next steps!</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Network Nudge</h3>
              <p className="text-sm">Reconnect with your network at the perfect moment.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/security-policy" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy-policy" className="hover:text-white">Privacy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@networknudge.com" className="hover:text-white">Support</a></li>
                <li><a href="mailto:privacy@networknudge.com" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Network Nudge, Inc. All rights reserved.</p>
            <p className="text-xs mt-2">LinkedIn is a trademark of LinkedIn Corporation. Network Nudge is not affiliated with LinkedIn.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
