/**
 * Orders Page
 * Displays user's orders with real API integration
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { resolveApiUrl } from '@/lib/api-base';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  service_type: string;
  subject_area: string;
  word_count: number;
  study_level: string;
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  created_at: string;
  updated_at: string;
}

type FilterStatus = 'all' | 'active' | 'completed';

const Orders: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (showRefresh = false) => {
    if (!user?.id) return;

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = await getToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(resolveApiUrl(`/api/orders/user/${user.id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      setOrders(data.orders || []);

      if (showRefresh) {
        toast.success('Orders refreshed');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The orders API may be unavailable.');
      } else {
        setError(err.message || 'Failed to load orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      fetchOrders();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'active') return orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    if (filter === 'completed') return orders.filter((o) => o.status === 'completed');
    return orders;
  }, [orders, filter]);

  // Auth check
  if (isLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Orders - HandyWriterz</title>
        </Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your orders.
          </p>
          <button
            onClick={() => navigate('/sign-in')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>My Orders - HandyWriterz</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your writing assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
          <Link
            to="/dashboard/new-order"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-gray-400" />
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === status
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        {filteredOrders.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Please try again later or contact support if the issue persists.
              </p>
              <button
                onClick={() => fetchOrders()}
                className="mt-3 text-sm text-red-700 dark:text-red-300 hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    'in-progress': { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-gray-100 text-gray-600', icon: AlertCircle, label: 'Cancelled' },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const dueDate = new Date(order.due_date);
  const isOverdue = dueDate < new Date() && order.status !== 'completed';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {order.service_type || 'Assignment'} — {order.subject_area || 'General'}
            </h3>
            <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.color)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <span>{order.word_count?.toLocaleString() || 0} words</span>
            <span>•</span>
            <span>{order.study_level || 'N/A'}</span>
            <span>•</span>
            <span className={cn(isOverdue && 'text-red-500 font-medium')}>
              Due {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              £{typeof order.price === 'number' ? order.price.toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {order.id.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={() => toast.success(`Viewing order ${order.id.slice(0, 8)}`)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            Details
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  filter: FilterStatus;
}

function EmptyState({ filter }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
      <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {filter === 'all'
          ? "You haven't placed any orders yet. Start by creating your first order."
          : `You don't have any ${filter} orders at the moment.`}
      </p>
      <Link
        to="/dashboard/new-order"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Create Your First Order
      </Link>
    </div>
  );
}

export default Orders; 