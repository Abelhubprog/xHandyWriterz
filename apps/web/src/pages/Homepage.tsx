import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Shield,
  Users,
  Check,
  ArrowRight,
  GraduationCap,
  Brain,
  Heart,
  BookOpen,
  Clock,
  MessageSquare,
  Phone,
  Star,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  MousePointer,
  ArrowUp,
  BookOpen as Book,
  MessageCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

type IconComponent = LucideIcon;

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 },
  initial: { scale: 1 }
};

const shimmerVariants = {
  animate: {
    x: ["0%", "100%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut"
    }
  }
};

// Turtle animation variants
const turtleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.5
    }
  },
  hover: {
    y: [-5, 0, -5],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

const wisdomVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 1,
      duration: 0.5
    }
  }
};

const wisdomMessages = [
  "Knowledge flows like water, but wisdom stays like stone.",
  "Slow progress is still progress. Be patient with yourself.",
  "The journey of a thousand papers begins with a single word.",
  "True learning happens when you apply what you've studied.",
  "A wise student knows when to ask for help.",
  "The pen is mightier than the sword, especially during exams."
];

function Homepage() {
  const { user, logout } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [wisdomIndex, setWisdomIndex] = useState(0);
  const [showWisdom, setShowWisdom] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield as IconComponent,
      title: "100% Plagiarism Free",
      description: "Every submission is thoroughly checked through Turnitin"
    },
    {
      icon: Users as IconComponent,
      title: "Expert Writers",
      description: "Qualified professionals in nursing and healthcare"
    },
    {
      icon: Clock as IconComponent,
      title: "24/7 Support",
      description: "Round-the-clock assistance for your academic needs"
    }
  ];

  const services = [
    {
      icon: GraduationCap as IconComponent,
      title: "Adult Health Nursing",
      description: "Expert support for adult nursing students",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-100/40 to-emerald-200/20",
      link: "/d/adult-health"
    },
    {
      icon: Brain as IconComponent,
      title: "Mental Health Nursing",
      description: "Specialized mental health nursing assistance",
      color: "from-violet-500 to-violet-600",
      bgColor: "from-violet-100/40 to-violet-200/20",
      link: "/d/mental-health"
    },
    {
      icon: Heart as IconComponent,
      title: "Child Nursing",
      description: "Dedicated pediatric nursing support",
      color: "from-sky-500 to-sky-600",
      bgColor: "from-sky-100/40 to-sky-200/20",
      link: "/d/child-nursing"
    },
    {
      icon: BookOpen as IconComponent,
      title: "Social Work",
      description: "Professional social work writing assistance",
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-100/40 to-amber-200/20",
      link: "/d/social-work"
    },
    {
      icon: Sparkles as IconComponent,
      title: "Artificial Intelligence",
      description: "Support for specialized AI and machine learning topics",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-100/40 to-indigo-200/20",
      link: "/d/ai"
    },
    {
      icon: Star as IconComponent,
      title: "Crypto",
      description: "Blockchain, cryptocurrency, and fintech research",
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-100/40 to-amber-200/20",
      link: "/d/crypto"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/sign-in');
    }
  };

  const handleCheckTurnitin = () => {
    navigate('/check-turnitin');
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const IconWrapper = ({ icon: Icon, className }: { icon: IconComponent; className?: string }) => {
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Header removed: use global Navbar from RootLayout */}

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-40 pb-24 px-4 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 right-10 h-64 w-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 h-72 w-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-40 h-56 w-56 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/90 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-md backdrop-blur-sm border border-blue-100"
            >
              <IconWrapper icon={Sparkles} className="h-4 w-4" />
              Professional Academic Support
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
            >
              Your Academic Success Partner
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Expert assistance for nursing, social work, and special education students.
              Get professional support for your academic journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={handleCheckTurnitin}
                className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-600/20 font-medium"
              >
                <motion.span
                  className="sign-in-btn-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  variants={shimmerVariants}
                  animate="animate"
                />
                <span className="relative z-10 flex items-center gap-2">
                  Check Turnitin Now
                  <IconWrapper icon={ArrowRight} className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/services')}
                className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/20 font-medium"
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <span className="relative z-10 flex items-center gap-2">
                  Explore Services
                  <IconWrapper icon={ArrowRight} className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative h-24"
            >
              {features.map((feature, index) => (
                <AnimatePresence key={feature.title} initial={false} mode="wait">
                  {index === activeFeature && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-xl border border-gray-100">
                        <IconWrapper icon={feature.icon} className="h-6 w-6 text-blue-600" />
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">{feature.title}</div>
                          <div className="text-sm text-gray-600">{feature.description}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-12"
            >
              <button
                onClick={() => scrollToSection(servicesRef)}
                className="flex flex-col items-center justify-center gap-2 text-blue-600 mx-auto animate-bounce"
              >
                <span className="text-sm font-medium">Discover Our Services</span>
                <MousePointer className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="py-24 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-100">
              <IconWrapper icon={Award} className="h-4 w-4" />
              Our Expertise
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Comprehensive Academic Support</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert assistance across multiple disciplines, tailored to your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="group relative bg-white border border-gray-100 p-8 rounded-2xl hover:border-transparent transition-all duration-300"
              >
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}></div>
                <div className="relative">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconWrapper icon={service.icon} className={`h-7 w-7 bg-gradient-to-r ${service.color} bg-clip-text text-transparent`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-300">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <Link
                    to={service.link}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${service.color} text-white rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300`}
                  >
                    Learn more
                    <IconWrapper icon={ChevronRight} className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
        <div className="absolute top-10 left-10 h-80 w-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 h-80 w-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto text-center bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-12 border border-gray-100"
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-blue-600/20">
              Ready to Excel?
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Ready to Excel in Your Studies?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of students who are achieving academic success with our support
          </p>

          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={async () => {
              setIsLoading(true);
              await navigate('/sign-in');
              setIsLoading(false);
            }}
            className="relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-600/20 font-medium group"
            disabled={isLoading}
          >
            <motion.span
              className="cta-btn-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              variants={shimmerVariants}
              animate="animate"
            />
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Get Started Now
                  <motion.span
                    variants={{
                      hover: { x: 5 },
                      initial: { x: 0 }
                    }}
                  >
                    <IconWrapper icon={ArrowRight} className="h-5 w-5" />
                  </motion.span>
                </>
              )}
            </span>
          </motion.button>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <IconWrapper icon={Shield} className="h-5 w-5 text-blue-600" />
              100% Plagiarism Free
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <IconWrapper icon={Users} className="h-5 w-5 text-purple-600" />
              Expert Writers
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <IconWrapper icon={Clock} className="h-5 w-5 text-indigo-600" />
              24/7 Support
            </div>
          </div>
        </motion.div>
      </section>

      {/* Turtle Wisdom Section */}
      <div className="fixed bottom-8 left-8 z-40">
        <motion.div
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={turtleVariants}
          className="relative cursor-pointer"
          onClick={() => {
            setShowWisdom(!showWisdom);
            if (!showWisdom) {
              setWisdomIndex(Math.floor(Math.random() * wisdomMessages.length));
            }
          }}
        >
          {/* Turtle Shell */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-green-700 to-green-900 rounded-full shadow-lg flex items-center justify-center">
            <div className="absolute inset-2 bg-gradient-to-br from-green-600 to-green-800 rounded-full">
              <div className="absolute inset-2 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Book className="h-3 w-3 text-green-900" />
                </div>
              </div>
            </div>

            {/* Turtle Head */}
            <div className="absolute -top-4 left-6 w-5 h-7 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>

            {/* Turtle Legs */}
            <div className="absolute -bottom-2 -left-2 w-4 h-5 bg-green-600 rounded-full"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-5 bg-green-600 rounded-full"></div>
            <div className="absolute -top-1 -left-3 w-4 h-5 bg-green-600 rounded-full"></div>
            <div className="absolute -top-1 -right-3 w-4 h-5 bg-green-600 rounded-full"></div>
          </div>

          {/* Wisdom Bubble */}
          <AnimatePresence>
            {showWisdom && (
              <motion.div
                variants={wisdomVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                className="absolute -top-20 -right-4 bg-white rounded-xl p-4 shadow-lg max-w-xs"
              >
                <div className="relative">
                  <p className="text-gray-700 text-sm font-medium">{wisdomMessages[wisdomIndex]}</p>
                  <div className="absolute -bottom-10 right-8 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-white border-r-8 border-r-transparent"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Action Button for Quick Access */}
      <AnimatePresence>
        {scrollY > 500 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-8 right-8 flex flex-col gap-2 z-50"
          >
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/sign-in')}
              className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <IconWrapper icon={ArrowRight} className="h-5 w-5" />
            </motion.button>

            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg hover:shadow-xl transition-shadow"
            >
              <IconWrapper icon={ArrowUp} className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add some styles for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Quick Links */}
      <motion.section
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our tools and resources designed to support your academic journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="p-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Learning Hub</h3>
                <p className="text-gray-600 mb-4">
                  Access free guides, templates, and academic resources to improve your writing skills
                </p>
                <Link to="/services" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
                  Explore Learning Hub <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="p-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Plagiarism Checker</h3>
                <p className="text-gray-600 mb-4">
                  Verify your work's originality with our advanced plagiarism detection tool
                </p>
                <Link to="/check-turnitin" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                  Check Turnitin <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="p-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                <p className="text-gray-600 mb-4">
                  Get immediate assistance from our expert support team at any time
                </p>
                <Link to="/contact" className="inline-flex items-center text-green-600 font-medium hover:text-green-800">
                  Contact Support <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Homepage;
