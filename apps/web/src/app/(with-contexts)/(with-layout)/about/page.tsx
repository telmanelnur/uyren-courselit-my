"use client"

import { useState, useEffect, useRef } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Target, Rocket } from "lucide-react"
import Link from "next/link"
import { ScrollAnimation, ScrollGroup } from "@/components/scroll-animation"

export default function AboutPage() {
    const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
    const timelineRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])

    const timelineItems = [
        {
            year: "July 2025",
            title: "Team Formation",
            description:
                "A group of Nazarbayev University students decided to create a startup to transform education with AI technology.",
            image: "img/placeholder.svg?height=250&width=350&text=Team+Formation+July+2025",
            color: "orange",
            colorClass: "bg-orange-600",
            side: "left",
        },
        {
            year: "August 2025",
            title: "NURIS Incubation",
            description:
                "Accepted into the NURIS incubation program by NU Impact Foundation, marking our first major milestone in startup development.",
            image: "img/placeholder.svg?height=250&width=350&text=NURIS+Incubation+August+2025",
            color: "blue",
            colorClass: "bg-blue-600",
            side: "right",
        },
        {
            year: "Late 2025",
            title: "School Partnerships",
            description:
                "Signed partnerships with schools in Astana to pilot our AI-powered educational platform and validate our approach.",
            image: "img/placeholder.svg?height=250&width=350&text=School+Partnerships+Late+2025",
            color: "green",
            colorClass: "bg-green-600",
            side: "left",
        },
        {
            year: "2026",
            title: "Scaling Phase",
            description: "Scaling across Kazakhstan and expanding to global markets with our proven AI education platform.",
            image: "img/placeholder.svg?height=250&width=350&text=Scaling+2026",
            color: "purple",
            colorClass: "bg-purple-600",
            side: "right",
        },
        {
            year: "Looking Ahead",
            title: "Future Growth",
            description:
                "Growing our team, expanding features, and building the leading AI education platform in Central Asia.",
            image: "img/placeholder.svg?height=250&width=350&text=Future+Growth",
            color: "indigo",
            colorClass: "bg-indigo-600",
            side: "left",
        },
    ]

    useEffect(() => {
        const observers: IntersectionObserver[] = []

        // Timeline line animation
        if (timelineRef.current) {
            const timelineObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const timeline = entry.target.querySelector(".timeline-line") as HTMLElement
                            if (timeline) {
                                timeline.style.height = "100%";
                            }
                        }
                    })
                },
                { threshold: 0.1 },
            )
            timelineObserver.observe(timelineRef.current)
            observers.push(timelineObserver)
        }

        // Timeline items animation
        itemRefs.current.forEach((ref, index) => {
            if (ref) {
                const itemObserver = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setVisibleItems((prev) => new Set([...prev, index]))
                            }
                        })
                    },
                    { threshold: 0.3 },
                )
                itemObserver.observe(ref)
                observers.push(itemObserver)
            }
        })

        return () => {
            observers.forEach((observer) => observer.disconnect())
        }
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

                <div className="absolute top-10 md:top-20 left-10 md:left-20 w-32 md:w-64 h-32 md:h-64 bg-brand-primary rounded-full opacity-10"></div>
                <div className="absolute bottom-10 right-10 md:right-20 w-40 md:w-80 h-40 md:h-80 bg-brand-primary rounded-full opacity-10"></div>
                <div className="absolute top-20 md:top-40 right-20 md:right-40 w-20 md:w-40 h-20 md:h-40 bg-brand-primary rounded-full opacity-10"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <ScrollAnimation variant="fadeUp" className="max-w-5xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                            We are <span className="text-brand-primary">Uyren.AI</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6 max-w-4xl mx-auto">
                            An AI-powered platform with a built-in tutor, hands-on practice, and automated learning. Designed for individuals and organizations, Uyren.AI makes education personalized, efficient, and effective.
                        </p>
                        <p className="text-base md:text-lg text-gray-400 mb-4">
                            Built by Nazarbayev University students, Uyren.AI delivers future-ready education.
                        </p>
                        <div className="inline-block bg-brand-primary/20 border border-brand-primary/30 rounded-full px-6 py-2">
                            <p className="text-brand-primary font-medium text-sm md:text-base">
                                We provide grants and discounts to make education accessible to everyone.
                            </p>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>

            {/* History Section - Enhanced Timeline */}
            <section className="py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <ScrollAnimation variant="fadeUp" className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our History</h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                            From university students to AI education pioneers
                        </p>
                    </ScrollAnimation>

                    <div className="max-w-4xl mx-auto">
                        <div ref={timelineRef} className="relative timeline-container">
                            {/* Vertical Line */}
                            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-200">
                                <div className="timeline-line absolute top-0 left-0 w-full bg-gradient-to-b from-brand-primary via-orange-500 to-purple-500 h-0 transition-all duration-[2000ms] ease-out"></div>
                            </div>

                            {/* Timeline items */}
                            <div className="space-y-8 md:space-y-16 relative">
                                {timelineItems.map((item, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => { itemRefs.current[index] = el }}
                                        className="relative timeline-item"
                                    >
                                        {/* Timeline Dot */}
                                        <div
                                            className={`timeline-dot hidden md:block absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        w-8 h-8 rounded-full border-4 border-white shadow-lg z-10 transition-all duration-700
        ${visibleItems.has(index) ? "opacity-100 scale-100" : "opacity-0 scale-50"}
        ${item.colorClass}`}
                                        ></div>

                                        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
                                            {/* Left Side */}
                                            {item.side === "left" ? (
                                                <>
                                                    <div
                                                        className={`transition-all duration-1000 md:pr-6 text-right ${visibleItems.has(index)
                                                            ? "opacity-100 translate-x-0"
                                                            : "opacity-0 -translate-x-12"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`timeline-year text-xl md:text-2xl font-bold mb-2 ${item.colorClass.replace('bg-', 'text-')}`}
                                                        >
                                                            {item.year}
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm md:text-base">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <div></div>
                                                    <div
                                                        className={`transition-all duration-1000 delay-300 md:pl-6 ${visibleItems.has(index)
                                                            ? "opacity-100 translate-x-0 scale-100"
                                                            : "opacity-0 translate-x-12 scale-95"
                                                            }`}
                                                    >
                                                        <div className="relative overflow-hidden rounded-lg shadow-lg group">
                                                            <img
                                                                src={`/${item.image}`}
                                                                alt={item.title}
                                                                className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className={`transition-all duration-1000 delay-300 md:pr-6 ${visibleItems.has(index)
                                                            ? "opacity-100 translate-x-0 scale-100"
                                                            : "opacity-0 -translate-x-12 scale-95"
                                                            }`}
                                                    >
                                                        <div className="relative overflow-hidden rounded-lg shadow-lg group">
                                                            <img
                                                                src={`/${item.image}`}
                                                                alt={item.title}
                                                                className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div></div>
                                                    <div
                                                        className={`transition-all duration-1000 md:pl-6 text-left ${visibleItems.has(index)
                                                            ? "opacity-100 translate-x-0"
                                                            : "opacity-0 translate-x-12"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`timeline-year text-xl md:text-2xl font-bold mb-2 ${item.colorClass.replace('bg-', 'text-')}`}
                                                        >
                                                            {item.year}
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm md:text-base">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision - Card Layout */}
            <section className="py-12 md:py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <ScrollGroup variant="fadeUp" staggerDelay={0.3} className="grid lg:grid-cols-2 gap-8 md:gap-12">
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center space-x-3 mb-4 md:mb-6">
                                <Target className="h-6 md:h-8 w-6 md:w-8 text-brand-primary" />
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Mission</h2>
                            </div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                                To make education practical, accessible, and powered by AI. We turn passive learning into active skills
                                through instant feedback, code execution, visualization, and adaptive pathways — so every learner can
                                succeed.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center space-x-3 mb-4 md:mb-6">
                                <Rocket className="h-6 md:h-8 w-6 md:w-8 text-blue-600" />
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Vision</h2>
                            </div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                                To become the leading AI-driven education platform in Kazakhstan and beyond, combining technology,
                                innovation, and accessibility to transform how the world learns.
                            </p>
                        </div>
                    </ScrollGroup>
                </div>
            </section>

            <Footer />
        </div>
    )
}