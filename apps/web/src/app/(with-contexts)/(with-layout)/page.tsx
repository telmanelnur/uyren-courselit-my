"use client"

import { useTranslation, Trans } from "react-i18next"
import Navigation from "@/components/navigation"
import Footer from "@/components/layout/footer"
import Testimonials from "@/components/layout/testimonials"
import { ScrollAnimation, ScrollGroup } from "@/components/scroll-animation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const { t } = useTranslation("common")

  const features = [
    {
      icon: "/img/gears.svg",
      title: t("feature_systematic_title"),
      description: t("feature_systematic_desc"),
    },
    {
      icon: "/img/python.svg",
      title: t("feature_practice_title"),
      description: t("feature_practice_desc"),
    },
    {
      icon: "/img/chart-line-up.svg",
      title: t("feature_growth_title"),
      description: t("feature_growth_desc"),
    },
    {
      icon: "/img/support.svg",
      title: t("feature_feedback_title"),
      description: t("feature_feedback_desc"),
    },
  ]

  const stats = [
    { number: "10+", label: t("stats_years_experience") },
    { number: "200+", label: t("stats_students_enrolled") },
    { number: "40+", label: t("stats_popular_courses") },
  ]

  const courses = [
    {
      slug: "python-course",
      image: "/img/python-course.jpeg",
      title: t("course_python_title"),
      level: t("course_python_level"),
    },
    {
      slug: "data-analytics-course",
      image: "/img/data-analytics.jpeg",
      title: t("course_data_title"),
      level: t("course_data_level"),
    },
  ]

  return (
    <div className="page-transition">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-background py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollAnimation variant="fadeUp" delay={0.2}>
              <div className="space-y-6">
                <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200 text-sm font-semibold px-4 py-2">
                  {t("badge_ai_platform")}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  <Trans i18nKey="hero_title" t={t} components={{ 0: <span className="text-brand-primary font-bold" /> }} />
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  {t("hero_subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/courses">
                    <Button
                      size="lg"
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {t("hero_start_learning")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 bg-transparent hover:scale-105 flex items-center"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {t("hero_watch_lecture")}
                  </Button>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeRight" delay={0.4}>
              <div className="relative">
                <div className="hidden md:block">
                  <Image
                    src="/img/banner_copy.png"
                    alt="Banner"
                    width={800}
                    height={600}
                  />
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <ScrollGroup staggerDelay={0.1}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <ScrollAnimation key={index} variant="scale">
                  <div className="text-center group hover:scale-110 transition-transform duration-300">
                    <div className="text-4xl lg:text-5xl font-bold text-brand-primary mb-2 group-hover:animate-bounce">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-medium text-sm lg:text-base whitespace-pre-line">
                      {stat.label}
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </ScrollGroup>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <ScrollAnimation variant="fadeUp">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                <Trans i18nKey="features_title" t={t} components={{ 0: <span className="text-brand-primary" /> }} />
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t("features_subtitle")}
              </p>
            </div>
          </ScrollAnimation>

          <ScrollGroup staggerDelay={0.2}>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <ScrollAnimation key={index} variant="fadeUp">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-background group hover:scale-105 hover:-translate-y-2">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 group-hover:rotate-12">
                        <Image 
                          src={feature.icon} 
                          alt={feature.title} 
                          width={30} 
                          height={30} 
                        />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </ScrollGroup>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <ScrollAnimation variant="fadeUp">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                <Trans i18nKey="courses_title" t={t} components={{ 0: <span className="text-brand-primary" /> }} />
              </h2>
            </div>
          </ScrollAnimation>

          <ScrollGroup staggerDelay={0.2}>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {courses.map((course, index) => (
                <ScrollAnimation key={index} variant="fadeUp">
                  <Link href={`/courses/${course.slug}`} className="block h-full group">
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-card group hover:scale-105">
                      <CardContent className="p-6">
                        <Image 
                          src={course.image} 
                          alt={course.title} 
                          width={400} 
                          height={200} 
                          className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="flex items-center gap-2 mb-3">
                          <Image 
                            src="/img/logo.svg" 
                            alt="logo" 
                            width={24} 
                            height={24} 
                            className="w-6 h-6 p-1 border border-muted-foreground rounded"
                          />
                          <p className="text-sm font-medium text-foreground">{t("courses_provider")}</p>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
                        <p className="text-muted-foreground">{course.level}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          </ScrollGroup>

          <ScrollAnimation variant="fadeUp">
            <div className="text-center">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 hover:scale-105"
                >
                  {t("courses_explore_more")}
                </Button>
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <ScrollAnimation variant="fadeUp">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">{t("cta_title")}</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                {t("cta_subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {t("cta_start_learning")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 bg-transparent hover:scale-105"
                  >
                    {t("cta_contact_us")}
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      <Footer />
    </div>
  )
}
