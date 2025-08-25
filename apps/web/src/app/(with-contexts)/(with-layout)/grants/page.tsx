"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Users, GraduationCap, Heart, FileText, UserCheck, Clock, Award, ChevronRight } from "lucide-react"
import { GrantApplicationForm } from "@/components/grant-application-form"

export default function GrantsPage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const grantTypes = [
    {
      title: "100% Grant",
      description:
        "Full access to all materials for eligible learners facing documented financial hardship or exceptional merit.",
      icon: <Award className="h-8 w-8 text-brand-primary" />,
      highlight: true,
    },
    {
      title: "Up to 50% Discount",
      description: "Partial aid based on social/financial circumstances and motivation.",
      icon: <Heart className="h-8 w-8 text-brand-primary" />,
      highlight: false,
    },
  ]

  const audiences = [
    {
      title: "High School Students",
      subtitle: "Grades 9–12",
      description: "Passing an entry test. Achievements considered (olympiads, projects, portfolio).",
      icon: <GraduationCap className="h-6 w-6" />,
    },
    {
      title: "University & College Students",
      subtitle: "Current enrollment",
      description: "100% Grant for difficult situations. Up to 50% based on application and verified data.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Motivated Learners",
      subtitle: "Limited resources",
      description: "Up to 50% discount. Requirement: Short interview + application form.",
      icon: <Heart className="h-6 w-6" />,
    },
  ]

  const steps = [
    {
      title: "Apply Online",
      description: "Fill out application form with basic info, motivation, and documents",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: "Entry Test",
      description: "Short online test for high school students; auto-graded",
      icon: <CheckCircle className="h-6 w-6" />,
    },
    {
      title: "Review & Verification",
      description: "Merit + need evaluation; optional interview",
      icon: <UserCheck className="h-6 w-6" />,
    },
    {
      title: "Decision & Onboarding",
      description: "Email decision; accepted learners get platform access",
      icon: <Award className="h-6 w-6" />,
    },
    {
      title: "Keep Your Aid",
      description: "Maintain progress/attendance; periodic check-ins",
      icon: <Clock className="h-6 w-6" />,
    },
  ]

  const testimonials = [
    {
      name: "Aruzhan K.",
      role: "Computer Science Student",
      content:
        "The AI programming course changed my perspective completely. The grant made it possible for me to access world-class education.",
      avatar: "AK",
    },
    {
      name: "Nursultan T.",
      role: "High School Graduate",
      content:
        "Thanks to Uyren.AI's support, I'm now confident in data science. The personalized learning approach is incredible.",
      avatar: "NT",
    },
    {
      name: "Aigerim S.",
      role: "University Student",
      content:
        "The financial aid program opened doors I never thought possible. The AI tutoring system is like having a personal mentor.",
      avatar: "AS",
    },
  ]

  const faqs = [
    {
      question: "Who is eligible?",
      answer:
        "Learners with strong motivation and/or verified financial need. We consider academic achievements, personal circumstances, and commitment to learning.",
    },
    {
      question: "Do I need to take a test?",
      answer:
        "High school applicants must take an entry test. University students and other learners are evaluated case by case based on their application.",
    },
    {
      question: "How long does it take?",
      answer: "Typical review takes 7–10 business days. We'll keep you updated throughout the process via email.",
    },
    {
      question: "Can I reapply?",
      answer: "Yes, you can reapply after 60 days with updated information or if your circumstances have changed.",
    },
    {
      question: "Will my data be safe?",
      answer:
        "We securely store and review only what's needed for the application process. Your privacy is our priority.",
    },
  ]

  return (
    <div className="page-transition">
      <Navigation />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-black via-gray-900 to-black py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,81,27,0.1),transparent_50%)]" />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Education should be <span className="text-brand-primary">accessible</span>.
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                At Uyren.AI, we believe everyone deserves a chance to learn — regardless of financial situation. Our
                grants and discounts support motivated learners ready to prove themselves.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply for a Grant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold transition-all duration-300 bg-transparent"
                >
                  See Eligibility
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">What We Offer</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Flexible financial support designed to make AI education accessible to everyone
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {grantTypes.map((grant, index) => (
                <Card
                  key={index}
                  className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                    grant.highlight ? "ring-2 ring-brand-primary" : ""
                  }`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 bg-brand-primary/10 rounded-full w-fit">{grant.icon}</div>
                    <CardTitle className="text-2xl font-bold text-black mb-2">
                      {grant.title}
                      {grant.highlight && <Badge className="ml-2 bg-brand-primary text-white">Most Popular</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-lg leading-relaxed">
                      {grant.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Who Can Apply */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">Who Can Apply</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We support learners from all backgrounds and educational levels
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {audiences.map((audience, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-brand-primary/10 rounded-lg">{audience.icon}</div>
                      <div>
                        <CardTitle className="text-xl font-bold text-black">{audience.title}</CardTitle>
                        <p className="text-brand-primary font-medium">{audience.subtitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">{audience.description}</CardDescription>
                    <Button variant="ghost" className="mt-4 text-brand-primary hover:text-brand-primary-hover p-0">
                      View details <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simple, transparent process from application to acceptance
              </p>
            </div>
            <div className="relative">
              {/* Connecting line for all steps */}
              <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gray-300 z-0 hidden md:block"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-6 mb-12 last:mb-0 relative">
                  <div className="flex-shrink-0 flex flex-col items-center z-10">
                    <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-black mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </section>
        {/* Selection Criteria */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">Selection Criteria</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We evaluate applications based on merit and need
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center gap-3">
                    <Award className="h-6 w-6 text-brand-primary" />
                    Merit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      Entry test score and academic performance
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      Achievements (olympiads, projects, portfolio)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      Motivation and commitment to learning
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center gap-3">
                    <Heart className="h-6 w-6 text-brand-primary" />
                    Need
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      Financial context and family situation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      Special conditions (health, circumstances)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      Supporting documentation and verification
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">What Our Students Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real stories from learners who received grants and transformed their futures
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="pt-6">
                    <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-black">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

          {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to apply?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Take the first step — we'll support your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowApplicationForm(true)}
              >
                Apply for a Grant
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold transition-all duration-300 bg-transparent"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about our grant program</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-black hover:text-brand-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>


        {/* Application Form Modal */}
        {showApplicationForm && <GrantApplicationForm onClose={() => setShowApplicationForm(false)} />}
      </div>

      <Footer />
    </div>
  )
}
