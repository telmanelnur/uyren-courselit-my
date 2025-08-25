"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animation"

export default function TestimonialsSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const testimonials = [
    {
      quote:
        "Uyren.AI completely changed how I approach learning. The AI-powered courses helped me understand complex programming concepts in a way that traditional methods never could.",
      author: "Aigerim K.",
      role: "Computer Science Student",
      image: "/placeholder.svg?height=80&width=80&text=AK",
      stars: 5,
      rotation: "-rotate-12",
    },
    {
      quote:
        "The personalized learning path and instant feedback made all the difference. I went from struggling with coding to landing my first tech internship!",
      author: "Daniyar T.",
      role: "Software Engineering Student",
      image: "/placeholder.svg?height=80&width=80&text=DT",
      stars: 5,
      rotation: "rotate-6",
    },
    {
      quote:
        "The hands-on projects and real-world applications at Uyren.AI prepared me for the tech industry better than any traditional program could.",
      author: "Aida S.",
      role: "Data Science Graduate",
      image: "/placeholder.svg?height=80&width=80&text=AS",
      stars: 5,
      rotation: "-rotate-3",
    },
    {
      quote:
        "Amazing platform! The AI tutoring system understood exactly where I was struggling and provided targeted help. My grades improved dramatically.",
      author: "Nurlan B.",
      role: "AI/ML Student",
      image: "/placeholder.svg?height=80&width=80&text=NB",
      stars: 5,
      rotation: "rotate-8",
    },
    {
      quote:
        "Uyren.AI's innovative approach to education opened doors I never thought possible. The skills I learned here got me into my dream university program.",
      author: "Zhanel M.",
      role: "University Freshman",
      image: "/placeholder.svg?height=80&width=80&text=ZM",
      stars: 5,
      rotation: "-rotate-6",
    },
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollAnimation variant="fadeUp" className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">What Students Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from students who've experienced the Uyren.AI difference
          </p>
        </ScrollAnimation>

        <div className="flex flex-wrap justify-center items-center gap-8 max-w-7xl mx-auto min-h-[400px]">
          {testimonials.map((testimonial, index) => {
            const isCorner = index === 0 || index === 4
            const isCenter = index === 1 || index === 2 || index === 3

            return (
              <ScrollAnimation
                key={index}
                variant={index % 2 === 0 ? "fadeLeft" : "fadeRight"}
                delay={index * 0.1}
                className={`relative transition-all duration-500 ${testimonial.rotation} ${
                  isCorner
                    ? hoveredCard === index
                      ? "opacity-100 scale-110 z-20"
                      : "opacity-40 scale-95 z-10"
                    : "opacity-100 scale-100 z-15"
                } ${hoveredCard === index ? "rotate-0" : ""}`}
                style={{
                  transform: hoveredCard === index ? "rotate(0deg) scale(1.1)" : "",
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`bg-background rounded-2xl p-6 w-80 h-72 transition-all duration-500 border ${
                    hoveredCard === index && isCorner
                      ? "shadow-2xl shadow-brand-primary/30 border-2 border-brand-primary/60 ring-4 ring-brand-primary/30"
                      : isCenter
                        ? "shadow-xl border-border"
                        : "shadow-lg border-border/50"
                  }`}
                >
                  {/* Stars */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-brand-primary fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed line-clamp-4">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">{testimonial.author}</div>
                      <div className="text-muted-foreground text-xs">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            )
          })}
        </div>
      </div>
    </section>
  )
}
