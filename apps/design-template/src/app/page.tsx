'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BaseLayout, useSiteInfo, useTheme } from "../components";

export default function Home() {
  const { siteInfo } = useSiteInfo();
  const { theme, isDarkMode } = useTheme();
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  // Get current color scheme
  const currentColors = isDarkMode ? theme.theme.colors.dark : theme.theme.colors.light;

  const featureList = [
    { 
      icon: '/img/gears.svg', 
      title: 'Systematic approach', 
      description: 'Courses are divided into modules, assignments, and final projects. Clear structure over chaos.' 
    },
    { 
      icon: '/img/python.svg', 
      title: 'Built-in practice', 
      description: 'Each topic comes with tasks and case studies. Learning means solving, not just watching.' 
    },
    { 
      icon: '/img/chart-line-up.svg', 
      title: 'Growth through understanding', 
      description: 'No cramming. Only deep, truly engineering-level thinking.' 
    },
    { 
      icon: '/img/support.svg', 
      title: 'Feedback', 
      description: 'Smart chatbot and expert support. Answers come when they&apos;re really needed.' 
    },
  ];

  const courseList = [
    { 
      slug: 'python-course', 
      image: '/img/python-course.jpeg', 
      title: 'Intro to Python Programming', 
      level: 'Level: Beginner · Core Skill' 
    },
    { 
      slug: 'data-analytics-course', 
      image: '/img/data-analytics.jpeg', 
      title: 'Data Analytics Introduction', 
      level: 'Level: Beginner · Core Skill' 
    },
  ];

  const testimonials = [
    { 
      name: 'Aidos N.', 
      university: 'Student at Nazarbayev University', 
      img: '/img/aidos_n.jpg', 
      text: 'The organized material and system of deadlines helped me to study with discipline. And the practical experience — labs and quizzes — kept me engaged.' 
    },
    { 
      name: 'Aruzhan M.', 
      university: 'Student at Kazakh-British University', 
      img: '/img/aruzhan_m.jpg', 
      text: 'I liked how every topic was explained logically and without extra fluff. I felt each module carried real understanding, not just translated content.' 
    },
    { 
      name: 'Aldina A.', 
      university: 'Student at Sabanci University', 
      img: '/img/aldina_m.jpg', 
      text: 'With Uyren.Ai, I finally understood how to study effectively. Each block gave me clarity, and I began to connect better with my IT career goals.' 
    },
  ];

  const parentTestimonials = [
    {
      name: 'Jennifer K.',
      relation: 'Parent of 8th Grader',
      text: 'SGS transformed my daughter\'s confidence and character. The teachers truly care about each student\'s growth and development.',
      highlighted: true
    },
    {
      name: 'Michael T.',
      relation: 'Parent of Graduate',
      text: 'The academic preparation here is exceptional. My son was well-prepared for university challenges and received multiple scholarship offers.',
      highlighted: false
    },
    {
      name: 'Sarah L.',
      relation: 'Parent of Two Students',
      text: 'The values-based education at SGS has shaped our children into compassionate, responsible young adults. Worth every investment.',
      highlighted: false
    },
    {
      name: 'David R.',
      relation: 'Parent of Graduate',
      text: 'Outstanding faculty and curriculum. Our daughter developed leadership skills and confidence that will serve her throughout life.',
      highlighted: false
    },
    {
      name: 'Maria G.',
      relation: 'Parent of 6th Grader',
      text: 'The spiritual foundation combined with academic excellence creates well-rounded students. Highly recommend SGS to any family.',
      highlighted: false
    }
  ];

  const goToCourses = () => {
    // Navigate to courses page
    window.location.href = '/courses';
  };

  return (
    <BaseLayout 
      title={siteInfo.title}
      description={siteInfo.subtitle}
      showThemeEditor={showThemeEditor}
    >
      {/* Theme Editor Toggle */}
      <div className="fixed top-20 right-4 z-40">
        <button
          onClick={() => setShowThemeEditor(!showThemeEditor)}
          className="p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: currentColors.primary,
            color: currentColors.primaryForeground
          }}
          title="Toggle Theme Editor"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        </button>
      </div>
      
      {/* Hero Section */}
      <section 
        className="relative w-full py-20 px-4"
        style={{ backgroundColor: currentColors.background }}
      >
        <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12 justify-center">
          <div className="max-w-xl z-10 text-center md:text-left space-y-3">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-3"
              style={{ color: currentColors.foreground }}
            >
              <span style={{ color: currentColors.primary }}>Create</span> a future with real skills
            </h1>
            <p 
              className="text-lg md:text-xl mb-8"
              style={{ color: currentColors.secondary }}
            >
              Learn what actually matters: Python, ML, science. No fluff. Just challenges, structure, and growth.
            </p>
            <div className="flex flex-wrap gap-5 mb-10 justify-center md:justify-start">
              <button 
                onClick={goToCourses}
                className="px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: currentColors.primary,
                  color: currentColors.primaryForeground
                }}
              >
                Start Learning
              </button>
              <button 
                className="flex items-center gap-2 font-bold transition-all duration-300 hover:opacity-80"
                style={{ color: currentColors.foreground }}
              >
                <Image 
                  src="/img/play.svg" 
                  alt="Play Icon" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8" 
                />
                Watch Lecture
              </button>
            </div>
            <div className="flex gap-10 text-center justify-center md:justify-start">
              <div className="w-24">
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: currentColors.foreground }}
                >
                  10+
                </h2>
                <p 
                  className="text-sm leading-tight"
                  style={{ color: currentColors.secondary }}
                >
                  Years of<br />Experience
                </p>
              </div>
              <div className="w-24">
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: currentColors.foreground }}
                >
                  200+
                </h2>
                <p 
                  className="text-sm leading-tight"
                  style={{ color: currentColors.secondary }}
                >
                  Students<br />Enrolled
                </p>
              </div>
              <div className="w-24">
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: currentColors.foreground }}
                >
                  40+
                </h2>
                <p 
                  className="text-sm leading-tight"
                  style={{ color: currentColors.secondary }}
                >
                  Popular<br />Courses
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Image 
              src="/img/banner.png" 
              alt="Banner" 
              width={450} 
              height={450} 
              className="max-w-[450px] h-auto" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-16 px-4"
        style={{ backgroundColor: currentColors.accent }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 mb-16 items-center">
            <h2 
              className="text-4xl font-bold"
              style={{ color: currentColors.foreground }}
            >
              <span style={{ color: currentColors.primary }}>More</span> than just video lessons
            </h2>
            <p 
              className="text-lg md:text-xl max-w-lg md:pl-8 leading-relaxed"
              style={{ color: currentColors.secondary }}
            >
              Courses built with a system: theory, practice, support. Every module is a step toward real growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featureList.map((item, i) => (
              <div 
                key={i}
                className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: currentColors.card }}
              >
                <div className="flex items-center mb-5">
                  <div 
                    className="w-15 h-15 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: currentColors.accent }}
                  >
                    <Image 
                      src={item.icon} 
                      alt={item.title} 
                      width={30} 
                      height={30} 
                      className="w-8 h-8" 
                    />
                  </div>
                  <h3 
                    className="text-2xl font-semibold"
                    style={{ color: currentColors.foreground }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: currentColors.secondary }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section 
        className="py-16"
        style={{ backgroundColor: currentColors.background }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{ backgroundColor: currentColors.accent }}
          >
            <div className="w-full md:max-w-lg space-y-5">
              <h2 
                className="text-4xl font-bold break-words"
                style={{ color: currentColors.foreground }}
              >
                <span style={{ color: currentColors.primary }}>Courses</span> that lead to real results
              </h2>
              <Link 
                href="/courses"
                className="inline-block w-full sm:w-4/5 border-3 rounded-lg py-4 px-5 text-center font-bold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: currentColors.card,
                  borderColor: currentColors.primary,
                  color: currentColors.primary
                }}
              >
                Explore More Courses
              </Link>
            </div>
            <div className="w-full flex flex-wrap gap-5 justify-center md:justify-end">
              {courseList.map((course) => (
                <Link 
                  key={course.slug} 
                  href={`/courses/${course.slug}`}
                  className="flex-1 max-w-72 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: currentColors.card }}
                >
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    width={240} 
                    height={160} 
                    className="w-full rounded-lg mb-3 object-cover" 
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <Image 
                      src="/img/logo.svg" 
                      alt="logo" 
                      width={30} 
                      height={30} 
                      className="w-8 p-1 border rounded" 
                      style={{ borderColor: currentColors.secondary }}
                    />
                    <p 
                      className="text-base"
                      style={{ color: currentColors.secondary }}
                    >
                      Uyren Academy
                    </p>
                  </div>
                  <h3 
                    className="text-xl font-bold mb-3 break-words"
                    style={{ color: currentColors.foreground }}
                  >
                    {course.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: currentColors.secondary }}
                  >
                    {course.level}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Parents Say Section */}
      <section 
        className="py-16 px-4"
        style={{ backgroundColor: currentColors.background }}
      >
        <div className="mx-auto max-w-6xl">
          <h2 
            className="text-center text-4xl font-bold mb-4"
            style={{ color: currentColors.foreground }}
          >
            What Parents Say
          </h2>
          <p 
            className="text-center text-xl mb-8 px-5"
            style={{ color: currentColors.secondary }}
          >
            Hear from families who&apos;ve experienced the SGS difference
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {parentTestimonials.slice(0, 3).map((item, index) => (
              <div 
                key={item.name}
                className={`relative rounded-lg p-6 shadow-lg transition-all duration-500 hover:rotate-y-12 hover:scale-105 transform-style-preserve-3d ${
                  item.highlighted ? 'ring-2 ring-yellow-400' : ''
                }`}
                style={{
                  backgroundColor: currentColors.card,
                  borderColor: currentColors.border
                }}
              >
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p 
                  className="text-sm leading-relaxed mb-4 text-center"
                  style={{ color: currentColors.secondary }}
                >
                  "{item.text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: currentColors.secondary }}
                  ></div>
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: currentColors.foreground }}>
                      {item.name}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: currentColors.secondary }}
                    >
                      {item.relation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {parentTestimonials.slice(3).map((item) => (
              <div 
                key={item.name}
                className="relative rounded-lg p-6 shadow-lg transition-all duration-500 hover:rotate-y-12 hover:scale-105 transform-style-preserve-3d"
                style={{
                  backgroundColor: currentColors.card,
                  borderColor: currentColors.border
                }}
              >
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p 
                  className="text-sm leading-relaxed mb-4 text-center"
                  style={{ color: currentColors.secondary }}
                >
                  "{item.text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: currentColors.secondary }}
                  ></div>
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: currentColors.foreground }}>
                      {item.name}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: currentColors.secondary }}
                    >
                      {item.relation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
