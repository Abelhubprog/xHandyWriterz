import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, CheckCircle, ArrowUpRight, Calendar, CreditCard } from 'lucide-react';
import { useSubscription, PlanTier } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

const SubscriptionStatus: React.FC = () => {
  const {
    getCurrentPlan,
    getPlanFeatures,
    getPageLimit,
    getRevisionLimit,
    getDeliveryDays,
    getSupportLevel,
    isLoaded,
    isSignedIn,
  } = useSubscription();

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const planFeatures = getPlanFeatures(currentPlan);
  const planTier = planFeatures.tier;
  const pageLimit = getPageLimit();
  const revisionLimit = getRevisionLimit();
  const deliveryDays = getDeliveryDays();
  const supportLevel = getSupportLevel();

  const getPlanIcon = (tier: PlanTier) => {
    switch (tier) {
      case 'basic':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'standard':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'premium':
        return <Crown className="h-6 w-6 text-pink-500" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-purple-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPlanColor = (tier: PlanTier) => {
    switch (tier) {
      case 'basic':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'standard':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'premium':
        return 'border-pink-200 bg-pink-50 text-pink-800';
      case 'enterprise':
        return 'border-purple-200 bg-purple-50 text-purple-900';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getBadgeColor = (tier: PlanTier) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'standard':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-pink-100 text-pink-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpgrade = planTier !== 'enterprise';
  const isPaidPlan = planTier !== 'free';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getPlanIcon(planTier)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Current Subscription
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(planTier)}`}>
                {planFeatures.name} Plan
              </span>
              {planTier === 'free' && (
                <span className="text-sm text-gray-500">Free account</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {canUpgrade && (
            <Link to="/pricing">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
          {isPaidPlan && (
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
        </div>
      </div>

      {/* Plan Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <div className="text-2xl font-bold text-gray-900">
            {pageLimit === Infinity ? '∞' : pageLimit}
          </div>
          <div className="text-sm text-gray-600">Pages per order</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50">
          <div className="text-2xl font-bold text-gray-900">
            {deliveryDays}
          </div>
          <div className="text-sm text-gray-600">Days delivery</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50">
          <div className="text-2xl font-bold text-gray-900">
            {revisionLimit === 'unlimited' ? '∞' : revisionLimit}
          </div>
          <div className="text-sm text-gray-600">Revisions</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50">
          <div className="text-lg font-bold text-gray-900 truncate">
            {supportLevel}
          </div>
          <div className="text-sm text-gray-600">Support</div>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-2 mb-6">
        <h4 className="text-sm font-medium text-gray-900">Plan Features:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planFeatures.features.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 capitalize">
                {feature.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Call-to-Action for Free Users */}
      {planTier === 'free' && (
        <div className={`border rounded-lg p-4 ${getPlanColor('basic')}`}>
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Ready to get started?</h4>
              <p className="text-sm text-blue-700">
                Upgrade to a paid plan to access document uploads, professional assistance, and more.
              </p>
            </div>
            <Link to="/pricing">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Choose Plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Next Billing Info for Paid Plans */}
      {isPaidPlan && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Next billing date: </span>
              <span className="font-medium">Loading...</span>
            </div>
            <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
              View all plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
