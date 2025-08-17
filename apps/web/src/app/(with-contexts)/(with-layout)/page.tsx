import { Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    // Domain info is available for use if needed
    // useEffect(() => {
    //     // Domain info loaded and available
    // }, [address, siteInfo]);

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

    const testimonials = [
        {
            name: "Jennifer K.",
            parentType: "Parent of 8th Grader",
            text: "SGS transformed my daughter's confidence and character. The teachers truly care about each student's growth and development.",
            rating: 5
        },
        {
            name: "Michael T.",
            parentType: "Parent of Graduate",
            text: "The academic preparation here is exceptional. My son was well-prepared for university challenges and received multiple scholarship offers.",
            rating: 5
        },
        {
            name: "Sarah L.",
            parentType: "Parent of Two Students",
            text: "The values-based education at SGS has shaped our children into compassionate, responsible young adults. Worth every investment.",
            rating: 5
        },
        {
            name: "David R.",
            parentType: "Parent of Graduate",
            text: "Outstanding faculty and curriculum. Our daughter developed leadership skills and confidence that will serve her throughout life.",
            rating: 5
        },
        {
            name: "Maria G.",
            parentType: "Parent of 6th Grader",
            text: "The spiritual foundation combined with academic excellence creates well-rounded students. Highly recommend SGS to any family.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen font-montserrat">
            {/* Hero Section */}
            <section className="relative w-full bg-background">
                {/* Mobile Banner Background */}
                <div className="md:hidden w-full bg-[url('/img/banner_copy.png')] bg-cover bg-center relative" style={{ paddingTop: "100%" }}>
                    <div className="absolute inset-0 bg-background/60"></div>
                </div>

                {/* Main Content */}
                <div className="absolute top-0 left-0 w-full h-full md:static md:h-auto md:py-[80px] px-[32px] flex justify-center">
                    <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-[48px] justify-center">
                        <div className="max-w-xl z-10 text-center md:text-left space-y-[12px]">
                            <h1 className="text-[32px] md:text-[48px] font-[700] text-foreground mb-[12px]">
                                <span className="text-brand-primary font-[700]">Create</span> a future with real skills
                            </h1>
                            <p className="text-[16px] md:text-[18px] lg:text-[20px] font-[500] text-muted-foreground mb-[32px]">
                                Learn what actually matters: Python, ML, science. No fluff. Just challenges, structure, and growth.
                            </p>
                            <div className="flex flex-wrap gap-[20px] mb-[40px] justify-center md:justify-start">
                                <Link href="/courses">
                                    <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-[700] py-[12px] px-[24px] rounded-full text-[14px] md:text-[16px] transition-all duration-300">
                                        Start Learning
                                    </button>
                                </Link>
                                <button className="flex items-center gap-[8px] text-foreground font-[700] text-[14px] md:text-[16px]">
                                    <Play className="w-[32px] h-[32px] md:w-[40px] md:h-[40px]" />
                                    Watch Lecture
                                </button>
                            </div>
                            <div className="flex gap-[40px] text-center justify-center md:justify-start">
                                {stats.map((stat, index) => (
                                    <div key={index} className="w-[96px]">
                                        <h2 className="text-[28px] md:text-[36px] font-[700] text-foreground">{stat.number}</h2>
                                        <p className="text-[12px] md:text-[14px] leading-tight text-muted-foreground whitespace-pre-line">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:block -ml-[48px]">
                            <Image src="/img/banner.png" alt="Banner" width={450} height={400} className="max-w-[450px] h-auto" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-[28px] px-[28px] md:py-[40px] md:px-[80px] bg-card">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[100px] mb-[10px] md:mb-[60px] items-center">
                        <h2 className="text-[42px] font-[700] text-foreground">
                            <span className="text-brand-primary">More</span> than just video lessons
                        </h2>
                        <p className="text-[18px] md:text-[20px] text-muted-foreground max-w-[524px] md:pl-[30px] leading-snug">
                            Courses built with a system: theory, practice, support. Every module is a step toward real growth.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px]">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-background p-[30px] rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)] border border-border transition-all duration-300">
                                <div className="flex items-center mb-[20px]">
                                    <div className="w-[60px] h-[60px] bg-muted rounded-full flex items-center justify-center mr-[10px]">
                                        <Image src={feature.icon} alt={feature.title} width={30} height={30} className="w-[30px] h-[30px]" />
                                    </div>
                                    <h3 className="text-[22px] font-[600] text-foreground">{feature.title}</h3>
                                </div>
                                <p className="text-[20px] leading-[1.5] font-[400] text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section className="py-[60px] bg-muted">
                <div className="mx-auto max-w-[1280px] rounded-[40px] p-[30px_24px] flex flex-col md:flex-row items-center justify-between gap-[20px]">
                    <div className="w-full md:max-w-[560px] space-y-[20px]">
                        <h2 className="text-[42px] font-[700] text-foreground break-words">
                            <span className="text-brand-primary text-center">Courses</span> that lead to real results
                        </h2>
                        <Link href="/courses" className="inline-block w-full sm:w-[80%] bg-background border-[3px] border-brand-primary text-brand-primary text-[24px] font-[700] rounded-[10px] py-[15px] px-[20px] text-center hover:bg-brand-primary hover:text-white transition-all duration-300">
                            Explore More Courses
                        </Link>
                    </div>
                    <div className="w-full flex flex-wrap gap-[20px] justify-center md:justify-end">
                        {courses.map((course) => (
                            <Link key={course.slug} href={`/courses/${course.slug}`} className="flex-1 max-w-[280px] bg-card rounded-[12px] p-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)] border border-border transition-all duration-300">
                                <Image src={course.image} alt={course.title} width={280} height={160} className="w-full rounded-[10px] mb-[10px] object-cover" />
                                <div className="flex items-center gap-[5px] mb-[5px]">
                                    <Image src="/img/logo.svg" alt="logo" width={30} height={30} className="w-[30px] p-[2px] border border-muted-foreground rounded-[5px]" />
                                    <p className="text-[16px] font-[400] text-foreground">Uyren Academy</p>
                                </div>
                                <h3 className="text-[20px] font-[700] text-foreground mb-[10px] break-words">{course.title}</h3>
                                <p className="text-[14px] font-[400] text-muted-foreground">{course.level}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-[80px] bg-background relative overflow-hidden">
                <div className="mx-auto max-w-[1280px] px-[20px]">
                    <div className="text-center mb-[60px]">
                        <h2 className="text-[48px] font-[700] text-foreground mb-[20px]">
                            What Parents Say
                        </h2>
                        <p className="text-[20px] font-[400] text-muted-foreground max-w-[600px] mx-auto">
                            Hear from families who've experienced the SGS difference
                        </p>
                    </div>

                    <div className="relative">
                        {/* Testimonial Cards with Rotations */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] items-center justify-items-center">
                            {/* Card 1 - Top Left (Slightly Clockwise) */}
                            <div className="group relative transform rotate-2 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105 hover:z-10">
                                <div className="bg-card rounded-[16px] border-2 border-transparent group-hover:border-amber-400/60 p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-500 max-w-[320px]">
                                    <div className="flex items-center gap-[8px] mb-[20px]">
                                        {[...Array(testimonials[0]?.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-[20px] h-[20px] fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[16px] font-[400] text-foreground leading-[1.6] mb-[20px]">
                                        "{testimonials[0]?.text || ''}"
                                    </p>
                                    <div className="flex items-center gap-[16px]">
                                        <div className="w-[48px] h-[48px] bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-[18px] font-[600] text-muted-foreground">
                                                {testimonials[0]?.name?.split(' ')[0]?.[0] || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-[700] text-foreground text-[16px]">{testimonials[0]?.name || ''}</p>
                                            <p className="text-[14px] font-[400] text-muted-foreground">{testimonials[0]?.parentType || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Top Middle (Slightly Counter-clockwise) */}
                            <div className="group relative transform -rotate-1 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105 hover:z-10">
                                <div className="bg-card rounded-[16px] border-2 border-transparent group-hover:border-amber-400/60 p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-500 max-w-[320px]">
                                    <div className="flex items-center gap-[8px] mb-[20px]">
                                        {[...Array(testimonials[1]?.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-[20px] h-[20px] fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[16px] font-[400] text-foreground leading-[1.6] mb-[20px]">
                                        "{testimonials[1]?.text || ''}"
                                    </p>
                                    <div className="flex items-center gap-[16px]">
                                        <div className="w-[48px] h-[48px] bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-[18px] font-[600] text-muted-foreground">
                                                {testimonials[1]?.name?.split(' ')[0]?.[0] || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-[700] text-foreground text-[16px]">{testimonials[1]?.name || ''}</p>
                                            <p className="text-[14px] font-[400] text-muted-foreground">{testimonials[1]?.parentType || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 - Top Right (Slightly Clockwise) */}
                            <div className="group relative transform rotate-1 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105 hover:z-10">
                                <div className="bg-card rounded-[16px] border-2 border-transparent group-hover:border-amber-400/60 p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-500 max-w-[320px]">
                                    <div className="flex items-center gap-[8px] mb-[20px]">
                                        {[...Array(testimonials[2]?.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-[20px] h-[20px] fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[16px] font-[400] text-foreground leading-[1.6] mb-[20px]">
                                        "{testimonials[2]?.text || ''}"
                                    </p>
                                    <div className="flex items-center gap-[16px]">
                                        <div className="w-[48px] h-[48px] bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-[18px] font-[600] text-muted-foreground">
                                                {testimonials[2]?.name?.split(' ')[0]?.[0] || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-[700] text-foreground text-[16px]">{testimonials[2]?.name || ''}</p>
                                            <p className="text-[14px] font-[400] text-muted-foreground">{testimonials[2]?.parentType || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 - Bottom Left (Slightly Counter-clockwise) */}
                            <div className="group relative transform -rotate-2 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105 hover:z-10 md:col-start-1">
                                <div className="bg-card rounded-[16px] border-2 border-transparent group-hover:border-amber-400/60 p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-500 max-w-[320px]">
                                    <div className="flex items-center gap-[8px] mb-[20px]">
                                        {[...Array(testimonials[3]?.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-[20px] h-[20px] fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[16px] font-[400] text-foreground leading-[1.6] mb-[20px]">
                                        "{testimonials[3]?.text || ''}"
                                    </p>
                                    <div className="flex items-center gap-[16px]">
                                        <div className="w-[48px] h-[48px] bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-[18px] font-[600] text-muted-foreground">
                                                {testimonials[3]?.name?.split(' ')[0]?.[0] || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-[700] text-foreground text-[16px]">{testimonials[3]?.name || ''}</p>
                                            <p className="text-[14px] font-[400] text-muted-foreground">{testimonials[3]?.parentType || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 5 - Bottom Right (Slightly Clockwise) */}
                            <div className="group relative transform rotate-1 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105 hover:z-10 md:col-start-3">
                                <div className="bg-card rounded-[16px] border-2 border-transparent group-hover:border-amber-400/60 p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-500 max-w-[320px]">
                                    <div className="flex items-center gap-[8px] mb-[20px]">
                                        {[...Array(testimonials[4]?.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-[20px] h-[20px] fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[16px] font-[400] text-foreground leading-[1.6] mb-[20px]">
                                        "{testimonials[4]?.text || ''}"
                                    </p>
                                    <div className="flex items-center gap-[16px]">
                                        <div className="w-[48px] h-[48px] bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-[18px] font-[600] text-muted-foreground">
                                                {testimonials[4]?.name?.split(' ')[0]?.[0] || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-[700] text-foreground text-[16px]">{testimonials[4]?.name || ''}</p>
                                            <p className="text-[14px] font-[400] text-muted-foreground">{testimonials[4]?.parentType || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
