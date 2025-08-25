"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CommunityJoinForm } from "@/components/community/community-join-form"
import { Users, MessageCircle, Code, Trophy, Calendar, Star, CheckCircle, Zap, Target } from "lucide-react"
export default function CommunityPage() {
  const [showJoinForm, setShowJoinForm] = useState(false)

  const benefits = [
    {
      icon: Users,
      title: "Mentors & Peers",
      description: "Ask questions, get feedback, connect with learners at every level.",
    },
    {
      icon: Code,
      title: "Build Together",
      description: "Team up for projects, hack nights, and challenges.",
    },
    {
      icon: Zap,
      title: "Get Help Fast",
      description: "Office hours, Q&A threads, and peer reviews.",
    },
    {
      icon: Target,
      title: "Stay Motivated",
      description: "Sprints, milestones, and weekly check-ins.",
    },
  ]

  const channels = [
    {
      name: "Discord Server",
      description: "Primary hub for Q&A, voice rooms, project channels.",
      handle: "discord.gg/uyrenai",
      url: "https://discord.gg/",
      icon: "💬",
      primary: true,
    },
    {
      name: "Telegram Channel",
      description: "Announcements & quick updates.",
      handle: "@uyrenai",
      url: "https://t.me/uyrenai",
      icon: "📱",
      primary: false,
    },
    {
      name: "Instagram",
      description: "Wins, stories, highlights.",
      handle: "@uyrenai",
      url: "https://www.instagram.com/uyrenai/",
      icon: "📸",
      primary: false,
    },
  ]

  const activities = [
    {
      title: "Ask & Answer",
      description: "Topic threads for Programming, Analytics, AI, Data Science.",
      icon: MessageCircle,
    },
    {
      title: "Project Pods",
      description: "Small groups working on mini-projects; weekly demo day.",
      icon: Users,
    },
    {
      title: "Live Calls & Challenges",
      description: "Scheduled Zoom/Discord calls, weekly coding challenges.",
      icon: Calendar,
    },
    {
      title: "Peer Reviews",
      description: "Share code, get feedback, iterate faster.",
      icon: CheckCircle,
    },
  ]

  const onboardingSteps = [
    {
      step: 1,
      title: "Join a channel",
      description: "Discord/Telegram",
      icon: Users,
    },
    {
      step: 2,
      title: "Pick your track",
      description: "Programming, Analytics, AI, Data Science",
      icon: Target,
    },
    {
      step: 3,
      title: "Introduce yourself",
      description: "Short post template",
      icon: MessageCircle,
    },
    {
      step: 4,
      title: "Join a project pod",
      description: "Or a weekly challenge",
      icon: Code,
    },
    {
      step: 5,
      title: "Ship & Showcase",
      description: "Post wins; get a completion badge",
      icon: Trophy,
    },
  ]

  const roles = [
    { name: "Member", description: "Default", color: "bg-gray-100 text-gray-800" },
    { name: "Contributor", description: "Helps others; frequent peer reviews", color: "bg-blue-100 text-blue-800" },
    { name: "Mentor", description: "Validated expert; runs office hours", color: "bg-green-100 text-green-800" },
    {
      name: "Champion",
      description: "Wins challenges; completes projects",
      color: "bg-brand-primary/10 text-brand-primary",
    },
  ]

  const events = [
    { name: "Weekly Study Sprint", description: "Accountability call" },
    { name: "Bi-weekly Project Demo Night", description: "Show your work" },
    { name: "Monthly AMA / Workshop", description: "Learn from experts" },
  ]

  const testimonials = [
    {
      name: "Aruzhan K.",
      text: "The community helped me land my first developer job. The peer reviews were invaluable!",
      role: "Software Developer",
    },
    {
      name: "Nursultan T.",
      text: "Project pods made learning so much more engaging. Built 3 apps with my team!",
      role: "Data Analyst",
    },
    {
      name: "Aigerim S.",
      text: "The mentors here are amazing. Always ready to help and guide you through challenges.",
      role: "AI Researcher",
    },
  ]

  return (
    <div className="page-transition">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-black text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Don't learn <span className="text-brand-primary">alone</span>. Be part of the community.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              We're building more than a platform — we're building a supportive space to learn, build, and grow
              together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg"
                onClick={() => window.open("https://discord.gg/", "_blank")}
              >
                Join Discord
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
                onClick={() => window.open("https://t.me/uyrenai", "_blank")}
              >
                Join Telegram
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Community */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Why Community?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learning is better together. Here's what makes our community special.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-primary/20 transition-colors">
                    <benefit.icon className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Where We Hang Out */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Where We Hang Out</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our channels and be part of the conversation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {channels.map((channel, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-6">{channel.icon}</div>
                  <h3 className="text-2xl font-bold text-black mb-2">{channel.name}</h3>
                  <p className="text-gray-600 mb-4">{channel.description}</p>
                  <p className="text-brand-primary font-mono text-sm mb-6">{channel.handle}</p>
                  <Button
                    className={`w-full ${channel.primary ? "bg-brand-primary hover:bg-brand-primary-hover" : "bg-black hover:bg-gray-800"} text-white`}
                    onClick={() => window.open(channel.url, "_blank")}
                  >
                    {channel.name.includes("Discord")
                      ? "Join Discord"
                      : channel.name.includes("Telegram")
                        ? "Join Telegram"
                        : "Follow on Instagram"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">What You Can Do</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Engage, learn, and grow with various community activities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-primary/10 transition-colors">
                    <activity.icon className="w-8 h-8 text-black group-hover:text-brand-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">{activity.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Getting Started</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your journey to becoming an active community member in 5 simple steps.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {onboardingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-lg">{step.description}</p>
                  </div>
                  <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                    <step.icon className="w-6 h-6 text-black group-hover:text-brand-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles & Badges */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Roles & Badges</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Grow your reputation and unlock new opportunities as you contribute.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {roles.map((role, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardContent className="p-6 text-center">
                  <Badge className={`${role.color} mb-4 px-4 py-2 text-sm font-semibold`}>{role.name}</Badge>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Rhythm */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Events & Rhythm</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Regular events to keep you engaged and learning.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {events.map((event, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-brand-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-black mb-2">{event.name}</h3>
                  <p className="text-gray-600">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code of Conduct */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Community Guidelines</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple rules to keep our community welcoming and productive.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="respect" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold text-black hover:text-brand-primary">
                  Be respectful
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-4">
                  Treat all community members with kindness and respect. We welcome learners from all backgrounds and
                  skill levels.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="spam" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold text-black hover:text-brand-primary">
                  No spam or harassment
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-4">
                  Keep discussions constructive and avoid repetitive posts. Harassment of any kind will not be
                  tolerated.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sources" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold text-black hover:text-brand-primary">
                  Cite sources; give constructive feedback
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-4">
                  When sharing resources or giving feedback, be specific and helpful. Credit original sources when
                  applicable.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ontopic" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold text-black hover:text-brand-primary">
                  Keep discussions on-topic
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-4">
                  Focus conversations on learning and building. Use appropriate channels for different topics.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">What Our Members Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real stories from our community members.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mr-4">
                      <Star className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-black">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Final CTA */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Learn together. <span className="text-brand-primary">Grow faster.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join a community that turns learning into real outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg"
              onClick={() => window.open("https://discord.gg/", "_blank")}
            >
              Join Discord
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
              onClick={() => window.open("https://t.me/uyrenai", "_blank")}
            >
              Join Telegram
            </Button>
          </div>
        </div>
      </section>

      {/* Join Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Join the Community</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Ready to start your learning journey with us?</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <CommunityJoinForm />
          </div>
        </div>
      </section>

     

      <Footer />
    </div>
  )
}
