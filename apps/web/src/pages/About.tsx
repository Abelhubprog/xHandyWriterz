import React from 'react';
import { Users, Award, Clock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const stats = [
    { label: 'Students Helped', value: '10,000+', icon: Users },
    { label: 'Average Rating', value: '4.9/5', icon: Award },
    { label: 'Response Time', value: '< 1 hour', icon: Clock },
    { label: 'Global Reach', value: '50+ Countries', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About HandyWriterz
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted partner in academic excellence. We help students achieve their full potential through expert guidance and support.
          </p>
        </div>

        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Icon className="w-8 h-8 mx-auto mb-4 text-purple-600" />
                      <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mission Statement */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              At HandyWriterz, we're committed to empowering students worldwide with the tools and support they need to excel in their academic journey. Through our comprehensive services and dedicated team of experts, we help transform educational challenges into opportunities for growth and success.
            </p>
          </section>

          {/* Values */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Excellence',
                  description: 'We maintain the highest standards in all our services, ensuring quality that exceeds expectations.'
                },
                {
                  title: 'Integrity',
                  description: 'We operate with complete transparency and ethical practices, building trust through honest interactions.'
                },
                {
                  title: 'Innovation',
                  description: 'We continuously evolve our services to meet the changing needs of modern education.'
                }
              ].map((value, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Academic Director',
                  image: '/team/sarah.jpg'
                },
                {
                  name: 'Michael Chen',
                  role: 'Head of Quality Assurance',
                  image: '/team/michael.jpg'
                },
                {
                  name: 'Emily Williams',
                  role: 'Student Success Manager',
                  image: '/team/emily.jpg'
                }
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
