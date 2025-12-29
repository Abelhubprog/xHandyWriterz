import React from 'react';
import { Link } from 'react-router-dom';
import { Book, FileText, CheckCircle, Edit3, BookOpen, Users, Brain, Clock, Shield } from 'lucide-react';

const LearningHub = () => {
  const services = [
    {
      title: 'Assignment Writing',
      description: 'Professional assignment writing services for all academic levels',
      icon: <Edit3 className="h-6 w-6 text-blue-500" />,
      path: '/services/assignment-writing'
    },
    {
      title: 'Essay Writing',
      description: 'Expert essay writing assistance across all subjects',
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      path: '/services/essay-writing'
    },
    {
      title: 'Dissertation Writing',
      description: 'Comprehensive dissertation and thesis writing support',
      icon: <Book className="h-6 w-6 text-indigo-500" />,
      path: '/services/dissertation-writing'
    },
    {
      title: 'Research Writing',
      description: 'In-depth research paper writing and methodology support',
      icon: <Brain className="h-6 w-6 text-green-500" />,
      path: '/services/research-writing'
    },
    {
      title: 'Proofreading & Editing',
      description: 'Professional editing and proofreading services',
      icon: <CheckCircle className="h-6 w-6 text-yellow-500" />,
      path: '/services/proofreading'
    },
    {
      title: 'Online Tutoring',
      description: 'One-on-one tutoring sessions with expert educators',
      icon: <Users className="h-6 w-6 text-red-500" />,
      path: '/services/online-tutoring'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Gateway to Academic Excellence
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our comprehensive range of academic services designed to support your educational journey
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.path}
            to={service.path}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
          >
            <div className="p-8">
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">
                {service.description}
              </p>
              <div className="mt-4 flex items-center text-blue-600 font-medium">
                Learn More
                <BookOpen className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose HandyWriterz?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Expert Writers</h3>
            <p className="text-gray-600">
              Our team consists of qualified professionals with extensive experience in various academic fields
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Round-the-clock assistance to help you with any questions or concerns
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Guaranteed Quality</h3>
            <p className="text-gray-600">
              High-quality work that meets academic standards and your specific requirements
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto mt-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Excel in Your Studies?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have achieved academic success with HandyWriterz
          </p>
          <Link
            to="/sign-up"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow duration-300"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;
