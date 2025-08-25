import Navigation from "@/components/navigation"
import Footer from "@/components/layout/footer"
import Testimonials from "@/components/layout/testimonials"
import { ScrollAnimation, ScrollGroup } from "@/components/scroll-animation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const features = [
    {
      icon: "/img/gears.svg",
      title: "Systematic approach",
      description: "Courses are divided into modules, assignments, and final projects. Clear structure over chaos."
    },
    {
      icon: "/img/python.svg",
      title: "Built-in practice",
      description: "Each topic comes with tasks and case studies. Learning means solving, not just watching."
    },
    {
      icon: "/img/chart-line-up.svg",
      title: "Growth through understanding",
      description: "No cramming. Only deep, truly engineering-level thinking."
    },
    {
      icon: "/img/support.svg",
      title: "Feedback",
      description: "Smart chatbot and expert support. Answers come when they're really needed."
    }
  ];

  const stats = [
    { number: "10+", label: "Years of\nExperience" },
    { number: "200+", label: "Students\nEnrolled" },
    { number: "40+", label: "Popular\nCourses" }
  ];

  const courses = [
    {
      slug: "python-course",
      image: "/img/python-course.jpeg",
      title: "Intro to Python Programming",
      level: "Level: Beginner · Core Skill"
    },
    {
      slug: "data-analytics-course",
      image: "/img/data-analytics.jpeg",
      title: "Data Analytics Introduction",
      level: "Level: Beginner · Core Skill"
    }
  ];

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
                  AI-Powered Education Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  <span className="text-brand-primary font-bold">Create</span> a future with real skills
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Learn what actually matters: Python, ML, science. No fluff. Just challenges, structure, and growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/courses">
                    <Button
                      size="lg"
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Start Learning
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 bg-transparent hover:scale-105 flex items-center"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Lecture
                  </Button>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeRight" delay={0.4}>
              <div className="relative">
                {/* <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg blur opacity-20 animate-pulse"></div>  */}
                <div className="hidden md:block">
                  <Image
                    src="/img/banner_copy.png"
                    alt="Banner"
                    width={800}
                    height={600}
                    // className="relative rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="md:hidden w-full relative">
                  {/* <div className="bg-[url('/img/banner_copy.png')] bg-cover bg-center rounded-lg" style={{ paddingTop: "100%" }} />
                  <div className="absolute inset-0 bg-background/60 rounded-lg"></div> */}
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
                <span className="text-brand-primary">More</span> than just video lessons
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Courses built with a system: theory, practice, support. Every module is a step toward real growth.
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
                          className="text-brand-primary group-hover:text-white" 
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
                <span className="text-brand-primary">Courses</span> that lead to real results
              </h2>
            </div>
          </ScrollAnimation>

          <ScrollGroup staggerDelay={0.2}>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {courses.map((course, index) => (
                <ScrollAnimation key={index} variant="fadeUp">
                  <Link 
                    href={`/courses/${course.slug}`} 
                    className="block h-full group"
                  >
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
                          <p className="text-sm font-medium text-foreground">Uyren Academy</p>
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
                  Explore More Courses
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
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Take the first step towards future-ready learning. Our team will help you start your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 bg-transparent hover:scale-105"
                  >
                    Contact Us
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