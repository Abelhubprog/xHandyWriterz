import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Clock, Users } from 'lucide-react';

const Support247: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-green-100 text-green-800 mb-4">24/7 Support</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Round-the-Clock Academic Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant help whenever you need it. Our support team is available 24/7 to assist with your academic needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Direct phone line available 24/7</p>
              <Button className="w-full">Call Now</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Instant chat with support agents</p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Email us anytime, get quick responses</p>
              <Button className="w-full">Send Email</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
          <p className="text-lg mb-6">Our expert team is standing by to assist you right now.</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Get Help Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Support247;
