"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, Target, TrendingUp, Award, Building, Heart, Zap } from "lucide-react"

export default function SponsorshipPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    sponsorshipType: "",
    budget: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sponsorship application:", formData)
    // Handle form submission
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="m--hero-section relative bg-gradient-to-br from-black via-gray-900 to-black py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,81,27,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-brand-primary/20 text-brand-primary border-brand-primary/30 hover:bg-brand-primary/30 transition-colors">
              Partnership Opportunities
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Partner with{" "}
              <span className="text-brand-primary  bg-clip-text text-transparent">
                UyrenAI
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join us in revolutionizing education through AI. Partner with UyrenAI to shape the future of learning and
              make a lasting impact on students worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="m--cta-button bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="mr-2 h-5 w-5" />
                Become a Sponsor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-all duration-300 bg-transparent"
              >
                View Partnership Tiers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="m--why-partner-section py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Partner with UyrenAI?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join a mission-driven organization that's transforming education through cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Global Reach",
                description: "Connect with students and educators across Kazakhstan and beyond",
                stat: "10K+ Students",
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Brand Visibility",
                description: "Showcase your commitment to education and innovation",
                stat: "High Impact",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Growth Partnership",
                description: "Grow alongside the future of AI-powered education",
                stat: "300% Growth",
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Social Impact",
                description: "Make a meaningful difference in students' lives",
                stat: "Lasting Impact",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="m--benefit-card group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-brand-primary/30"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-brand-primary/10 rounded-full text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{benefit.title}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    {benefit.stat}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="m--sponsorship-tiers py-20 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Sponsorship Tiers</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the partnership level that aligns with your goals and budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Bronze Partner",
                price: "$5,000",
                period: "annually",
                description: "Perfect for growing companies",
                features: ["Logo on website", "Social media mentions", "Newsletter inclusion", "Event recognition"],
                popular: false,
              },
              {
                name: "Silver Partner",
                price: "$15,000",
                period: "annually",
                description: "Ideal for established businesses",
                features: [
                  "Everything in Bronze",
                  "Course sponsorship",
                  "Webinar opportunities",
                  "Student mentorship program",
                  "Quarterly reports",
                ],
                popular: true,
              },
              {
                name: "Gold Partner",
                price: "$50,000",
                period: "annually",
                description: "For industry leaders",
                features: [
                  "Everything in Silver",
                  "Custom course development",
                  "Speaking opportunities",
                  "Exclusive events",
                  "Direct student recruitment",
                  "Co-branded content",
                ],
                popular: false,
              },
            ].map((tier, index) => (
              <Card
                key={index}
                className={`m--tier-card relative ${tier.popular ? "border-brand-primary shadow-xl scale-105" : "border-gray-200 dark:border-gray-700"} hover:shadow-xl transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-brand-primary text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-brand-primary">{tier.price}</span>
                    <span className="text-gray-600 dark:text-gray-300">/{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 text-brand-primary mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${tier.popular ? "bg-brand-primary hover:bg-brand-primary-hover" : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"} transition-colors`}
                  >
                    Choose {tier.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="m--application-form py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Start Your Partnership Journey</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Fill out the form below and our partnership team will get back to you within 24 hours
              </p>
            </div>

            <Card className="m--form-card shadow-xl border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                  Partnership Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+7 XXX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sponsorshipType">Sponsorship Tier *</Label>
                      <Select onValueChange={(value) => handleInputChange("sponsorshipType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sponsorship tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze Partner ($5,000)</SelectItem>
                          <SelectItem value="silver">Silver Partner ($15,000)</SelectItem>
                          <SelectItem value="gold">Gold Partner ($50,000)</SelectItem>
                          <SelectItem value="custom">Custom Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select onValueChange={(value) => handleInputChange("budget", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                          <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                          <SelectItem value="50k+">$50,000+</SelectItem>
                          <SelectItem value="custom">Custom Budget</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your company and partnership goals..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Submit Partnership Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="m--success-stories py-20 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Partner Success Stories</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how our partners are making a difference in education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                company: "TechKZ Solutions",
                logo: "🏢",
                testimonial:
                  "Partnering with UyrenAI has allowed us to directly impact the next generation of tech talent in Kazakhstan.",
                impact: "500+ students mentored",
                person: "Aidar Nazarbayev, CEO",
              },
              {
                company: "Almaty Innovation Hub",
                logo: "🚀",
                testimonial:
                  "The partnership has been instrumental in bridging the gap between industry and education.",
                impact: "50+ job placements",
                person: "Saule Khamitova, Director",
              },
              {
                company: "Digital Kazakhstan",
                logo: "💻",
                testimonial:
                  "UyrenAI's approach to AI education aligns perfectly with our digital transformation goals.",
                impact: "10+ courses sponsored",
                person: "Murat Ospanov, CTO",
              },
            ].map((story, index) => (
              <Card
                key={index}
                className="m--story-card hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">{story.logo}</div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{story.company}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {story.impact}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-gray-600 dark:text-gray-300 mb-4 italic">
                    "{story.testimonial}"
                  </blockquote>
                  <p className="text-sm text-gray-500 dark:text-gray-400">— {story.person}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="m--cta-section py-20 bg-gradient-to-r from-brand-primary to-orange-400">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Education Together?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join UyrenAI in revolutionizing education through AI. Let's create the future of learning together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-brand-primary hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Building className="mr-2 h-5 w-5" />
              Schedule a Meeting
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-all duration-300 bg-transparent"
            >
              Download Partnership Guide
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
