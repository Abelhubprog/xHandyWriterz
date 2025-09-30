import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Database, TrendingUp, FileText } from 'lucide-react';

const DeepResearch: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Deep Research Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive research solutions powered by advanced methodologies and expert analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Literature Review</h3>
              <p className="text-gray-600 text-sm">Comprehensive source analysis</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Database className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Data Collection</h3>
              <p className="text-gray-600 text-sm">Primary and secondary research</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analysis</h3>
              <p className="text-gray-600 text-sm">Statistical and qualitative analysis</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reporting</h3>
              <p className="text-gray-600 text-sm">Professional research reports</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Start Your Research Project</h2>
          <p className="text-lg mb-6">Get expert research assistance tailored to your needs</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Begin Research
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeepResearch;
