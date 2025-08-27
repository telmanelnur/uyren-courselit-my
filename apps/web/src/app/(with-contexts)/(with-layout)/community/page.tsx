"use client"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CommunityJoinForm } from "@/components/community/community-join-form"
import { Users, MessageCircle, Code, Trophy, Calendar, Star, CheckCircle, Zap, Target } from "lucide-react"

export default function CommunityPage() {
  const { t } = useTranslation("common")
  const [showJoinForm, setShowJoinForm] = useState(false)

  const benefits = [
    { icon: Users, title: t("benefit_mentors_title"), description: t("benefit_mentors_desc") },
    { icon: Code, title: t("benefit_build_title"), description: t("benefit_build_desc") },
    { icon: Zap, title: t("benefit_help_title"), description: t("benefit_help_desc") },
    { icon: Target, title: t("benefit_motivation_title"), description: t("benefit_motivation_desc") },
  ]

  const channels = [
    { name: t("channel_discord_name"), description: t("channel_discord_desc"), handle: "discord.gg/uyrenai", url: "https://discord.gg/", icon: "💬", primary: true },
    { name: t("channel_telegram_name"), description: t("channel_telegram_desc"), handle: "@uyrenai", url: "https://t.me/uyrenai", icon: "📱", primary: false },
    { name: t("channel_instagram_name"), description: t("channel_instagram_desc"), handle: "@uyrenai", url: "https://www.instagram.com/uyrenai/", icon: "📸", primary: false },
  ]

  const activities = [
    { title: t("activity_ask_title"), description: t("activity_ask_desc"), icon: MessageCircle },
    { title: t("activity_pods_title"), description: t("activity_pods_desc"), icon: Users },
    { title: t("activity_calls_title"), description: t("activity_calls_desc"), icon: Calendar },
    { title: t("activity_reviews_title"), description: t("activity_reviews_desc"), icon: CheckCircle },
  ]

  const onboardingSteps = [
    { step: 1, title: t("onboard_step1_title"), description: t("onboard_step1_desc"), icon: Users },
    { step: 2, title: t("onboard_step2_title"), description: t("onboard_step2_desc"), icon: Target },
    { step: 3, title: t("onboard_step3_title"), description: t("onboard_step3_desc"), icon: MessageCircle },
    { step: 4, title: t("onboard_step4_title"), description: t("onboard_step4_desc"), icon: Code },
    { step: 5, title: t("onboard_step5_title"), description: t("onboard_step5_desc"), icon: Trophy },
  ]

  const roles = [
    { name: t("role_member"), description: t("role_member_desc"), color: "bg-gray-100 text-gray-800" },
    { name: t("role_contributor"), description: t("role_contributor_desc"), color: "bg-blue-100 text-blue-800" },
    { name: t("role_mentor"), description: t("role_mentor_desc"), color: "bg-green-100 text-green-800" },
    { name: t("role_champion"), description: t("role_champion_desc"), color: "bg-brand-primary/10 text-brand-primary" },
  ]

  const events = [
    { name: t("event_weekly_title"), description: t("event_weekly_desc") },
    { name: t("event_biweekly_title"), description: t("event_biweekly_desc") },
    { name: t("event_monthly_title"), description: t("event_monthly_desc") },
  ]

  const testimonials = [
    { name: "Aruzhan K.", text: t("community_testimonial_aruzhan"), role: t("community_testimonial_role_dev") },
    { name: "Nursultan T.", text: t("community_testimonial_nursultan"), role: t("community_testimonial_role_analyst") },
    { name: "Aigerim S.", text: t("community_testimonial_aigerim"), role: t("community_testimonial_role_ai") },
  ]

  const guidelines = [
    { value: "respect", title: t("guideline_respect_title"), description: t("guideline_respect_desc") },
    { value: "spam", title: t("guideline_spam_title"), description: t("guideline_spam_desc") },
    { value: "sources", title: t("guideline_sources_title"), description: t("guideline_sources_desc") },
    { value: "ontopic", title: t("guideline_ontopic_title"), description: t("guideline_ontopic_desc") },
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
              {t("community_hero_title")} <span className="text-brand-primary">{t("community_hero_title_highlight")}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">{t("community_hero_desc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg" onClick={() => window.open("https://discord.gg/", "_blank")}>
                {t("community_hero_join_discord")}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent" onClick={() => window.open("https://t.me/uyrenai", "_blank")}>
                {t("community_hero_join_telegram")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Community */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("why_community_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("why_community_desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
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
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("where_we_hangout_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("where_we_hangout_desc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {channels.map((channel, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
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
                      ? t("join_discord")
                      : channel.name.includes("Telegram")
                        ? t("join_telegram")
                        : t("follow_instagram")}
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
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("what_you_can_do_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("what_you_can_do_desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
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
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("getting_started_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("getting_started_desc")}</p>
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
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("roles_badges_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("roles_badges_desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {roles.map((role, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
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
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("events_rhythm_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("events_rhythm_desc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {events.map((event, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
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
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("community_guidelines_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("community_guidelines_desc")}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {guidelines.map((guideline) => (
                <AccordionItem key={guideline.value} value={guideline.value} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-black hover:text-brand-primary">
                    {guideline.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pt-4">{guideline.description}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("community_testimonials_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("community_testimonials_desc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
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
            {t("community_cta_title")} <span className="text-brand-primary">{t("community_cta_title_highlight")}</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{t("community_cta_desc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg" onClick={() => window.open("https://discord.gg/", "_blank")}>
              {t("join_discord")}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent" onClick={() => window.open("https://t.me/uyrenai", "_blank")}>
              {t("join_telegram")}
            </Button>
          </div>
        </div>
      </section>

      {/* Join Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t("join_community_title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("join_community_desc")}</p>
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
