import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import services from '@/config/services';

const ServicesIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our range of specialized nursing services designed to support healthcare professionals.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.id}
                className="transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${service.color.bg} flex items-center justify-center text-white mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={service.path}>
                    <Button 
                      className={`w-full ${service.color.text} hover:${service.color.bg} hover:text-white`} 
                      variant="outline"
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need More Information?</h2>
          <p className="text-gray-600 mb-8">
            Contact our support team for detailed information about our services and how we can assist you.
          </p>
          <Button 
            variant="default" 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesIndex;
