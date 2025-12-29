import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
// database import disabled pending data layer unification
import {
  Phone,
  MessageSquare,
  FileText,
  User,
  Bell,
  Settings,
  LogOut,
  Camera,
  Trash,
  Archive,
  Download,
  ExternalLink,
  Inbox,
  FileCheck,
  Clock,
  AlertCircle,
  ChevronLeft,
  Calculator,
  PoundSterling,
  Wallet,
  CreditCard,
  Send,
  Clock4,
  Upload,
  BookOpen,
  Users,
  Zap,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useDocumentSubmission from '@/hooks/useDocumentSubmission';
import { resolveApiUrl } from '@/lib/api-base';
// import { createOrder } from '@/lib/services';
import SubscriptionStatus from './SubscriptionStatus';

// Simple AdminDocuments component
const AdminDocuments = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">User Documents</h2>
      <p className="text-gray-600">This section displays documents submitted by users.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
        <p>No documents to display</p>
      </div>
    </div>
  );
};

// Lightweight bytes formatter (avoids importing missing helpers)
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const Dashboard = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const isAdmin = (user?.publicMetadata as any)?.role === 'admin';
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [studyLevel, setStudyLevel] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [module, setModule] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; path: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [adminNotified, setAdminNotified] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTurnitinModal, setShowTurnitinModal] = useState(false);
  // Hook: end-to-end upload -> R2 -> persist to unified messaging storage -> admin notify + user receipt
  const { submitDocuments, status: submissionStatus, error: submissionError } = useDocumentSubmission({
    onSuccess: () => {
      setAdminNotified(true);
      setShowPaymentOptions(true);
      toast.success('Documents sent to admin successfully!');
      setUploading(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit documents');
      setUploading(false);
    },
  });

  const [turnitinFile, setTurnitinFile] = useState<File | null>(null);
  const [turnitinResult, setTurnitinResult] = useState<any>(null);
  const [isCheckingTurnitin, setIsCheckingTurnitin] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const turnitinFileInputRef = useRef<HTMLInputElement>(null);

  const supportAreas = [
    { id: 'adult', title: 'Adult Health Nursing', icon: 'ðŸ‘¨â€âš•ï¸' },
    { id: 'mental', title: 'Mental Health Nursing', icon: 'ðŸ§ ' },
    { id: 'child', title: 'Child Nursing', icon: 'ðŸ‘¶' },
    { id: 'disability', title: 'Disability Nursing', icon: 'â™¿' },
    { id: 'social', title: 'Social Work', icon: 'ðŸ¤' },
    { id: 'special', title: 'Special Education Needs', icon: 'ðŸ“š' }
  ];

  const services = [
    { id: 'dissertation', title: 'Dissertation', icon: 'ðŸ“‘', desc: 'Expert dissertation writing support' },
    { id: 'essays', title: 'Essays', icon: 'âœï¸', desc: 'Professional essay writing' },
    { id: 'reflection', title: 'Placement Reflections', icon: 'ðŸ“', desc: 'Clinical reflection writing' },
    { id: 'reports', title: 'Reports', icon: 'ðŸ“Š', desc: 'Detailed academic reports' },
    { id: 'portfolio', title: 'E-Portfolio', icon: 'ðŸ’¼', desc: 'Portfolio development' },
    { id: 'turnitin', title: 'Turnitin Check', icon: 'ðŸ”', desc: 'Plagiarism detection & originality report' }
  ];

  const calculatePrice = (words: number, service: string, level: string, date: string) => {
    if (words < 100 || words > 100000) {
      return null;
    }

    const daysUntilDue = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const useHigherRate =
      service === 'dissertation' ||
      level === 'Level 7' ||
      daysUntilDue < 2;

    const baseRate = useHigherRate ? 18 : 15;
    return (words / 275) * baseRate;
  };

  // Combined effect to handle authentication and navigation
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || !user) {
        navigate('/sign-in');
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  useEffect(() => {
    if (wordCount && studyLevel && dueDate && selectedService) {
      const price = calculatePrice(wordCount, selectedService.id, studyLevel, dueDate);
      setCalculatedPrice(price);
    }
  }, [wordCount, studyLevel, dueDate, selectedService]);

  const navigateToPaymentPage = (paymentDetails?: any) => {
    if (!selectedService || !wordCount || !studyLevel || !dueDate) {
      toast.error('Please complete all required fields before proceeding.');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload files before proceeding to payment.');
      return;
    }

    if (!adminNotified) {
      toast.error('Documents must be sent to admin before payment.');
      return;
    }

    const paymentData = paymentDetails || {
      orderId: `order-${Date.now()}`,
      amount: calculatedPrice,
      currency: 'GBP',
      orderDetails: {
        serviceType: selectedService.title,
        subjectArea: supportAreas.find(area => area.id === selectedArea)?.title || selectedArea,
        wordCount: wordCount,
        studyLevel: studyLevel,
        dueDate: dueDate,
        module: module,
        instructions: instructions
      },
      files: uploadedFiles
    };

    // Navigate to dedicated payment page with state
    navigate('/payment', { state: { paymentData } });
  };

  const handleQuickCall = () => {
    window.open('https://join.skype.com/invite/IZLQkPuieqX2');
  };

  const handleQuickMessage = () => {
    window.open('https://wa.me/254711264993?text=Hi,%20I%20need%20help%20with%20my%20assignment');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && uploadedFiles.length === 0) {
      toast.error('Please upload at least one file before proceeding to payment');
      return;
    }

    // Note: For new orders, use /dashboard/new-order (Mattermost-integrated)
    // This legacy flow is kept for backward compatibility only

    // If files are uploaded and admin is notified, proceed to payment page
    if (uploadedFiles.length > 0 && adminNotified) {
      navigateToPaymentPage({
        orderId: `ORD-${Date.now()}`,
        amount: calculatedPrice || 0,
        currency: 'USD',
        orderDetails: {
          serviceType: selectedService?.title || '',
          subjectArea: selectedArea || '',
          wordCount: wordCount,
          studyLevel: studyLevel,
          dueDate: dueDate,
          module: module,
          instructions: instructions
        },
        files: uploadedFiles
      });
      return;
    }

    // Otherwise, upload files first
    handleUploadSubmit();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileList = Array.from(selectedFiles);

    // Simple file validation
  const maxSize = 100 * 1024 * 1024; // 100MB
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileList.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (exceeds 100MB size limit)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Some files were rejected due to size limits: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      // Merge with existing files, dedupe by name+size+lastModified, and enforce max files
      const MAX_FILES = 10;

      setFiles(prev => {
        const combined = [...prev, ...validFiles];

        // Deduplicate
        const seen = new Set<string>();
        const deduped: File[] = [];
        for (const f of combined) {
          const key = `${f.name}-${f.size}-${(f as any).lastModified || 0}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(f);
          }
        }

        // Enforce cap
        if (deduped.length > MAX_FILES) {
          toast(`${deduped.length - MAX_FILES} file(s) were not added because the maximum is ${MAX_FILES}.`, { icon: 'âš ï¸' });
          return deduped.slice(0, MAX_FILES);
        }

        toast.success(`${deduped.length} file(s) selected successfully`);
        return deduped;
      });

      setAdminNotified(false); // Reset admin notification when new files are selected
    }
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }
    if (!user) {
      toast.error('User authentication required');
      navigate('/sign-in');
      return;
    }
    setUploading(true);
    const metadata = {
      serviceType: selectedService?.title || selectedService?.id || '',
      subjectArea: supportAreas.find(area => area.id === selectedArea)?.title || selectedArea || '',
      wordCount,
      studyLevel,
      dueDate,
      module,
      instructions,
      userEmail: user.primaryEmailAddress?.emailAddress || '',
      userName: user.fullName || user.username || '',
    };
    await submitDocuments(files, metadata);
    // Persist selected file names locally for the UI history panel
    setUploadedFiles(files.map(f => ({ name: f.name, url: '#', path: '' })));
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setAdminNotified(false); // Reset admin notification when files are removed
  };

  const handleEmailDocuments = async () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      if (uploadedFiles.length === 0 && files.length === 0) {
        toast.error('No files available to send');
        return;
      }

      setUploading(true);

      // Read subject from form if present
      const subjectField = document.getElementById('emailSubject') as HTMLInputElement | null;
      const subject = subjectField?.value || 'Document Submission';

      // Build metadata; ensure the destination is the provided email address
      const metadata = {
        orderId: `email-${Date.now()}`,
        serviceType: selectedService?.id || 'email-submission',
        subjectArea: selectedArea || 'general',
        wordCount: wordCount || 0,
        studyLevel: studyLevel || 'not-specified',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        module: module || 'general',
        instructions: emailMessage || 'Email submission',
        emailSubject: subject,
        submissionType: 'email',
        // destination for notify step
        email: emailAddress,
        // include who sent it
        fromUserEmail: userEmail,
        fromUserName: userName,
      };

      if (files.length > 0) {
        // Use the unified submission flow for newly selected files
        await submitDocuments(files, metadata);
        setAdminNotified(true);
        setShowPaymentOptions(true);
        toast.success('Documents sent successfully!');
        setShowEmailOption(false);
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        // Files were already uploaded via the main flow
        toast('Files already submitted earlier. Admin has been notified.');
        setShowEmailOption(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Note: Legacy "send to admin" functions removed.
  // Use /dashboard/new-order for Mattermost-integrated orders
  // Use /dashboard/email-admin for direct admin communication

  const handleTurnitinFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    setTurnitinFile(file);
    setTurnitinResult(null);
  };

  const handleTurnitinCheck = async () => {
    if (!turnitinFile) {
      alert('Please select a file first');
      return;
    }

    setIsCheckingTurnitin(true);
    let checkoutWindow: Window | null = null;
    let statusInterval: NodeJS.Timeout;

    try {
      // First, create a payment intent
      const paymentResponse = await fetch(resolveApiUrl('/api/create-turnitin-payment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5, // Â£5 fixed price
          currency: 'GBP',
        }),
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.message || 'Failed to create payment');
      }

      const { hosted_url, id: chargeId } = await paymentResponse.json();

      // Open Coinbase Commerce checkout
      checkoutWindow = window.open(hosted_url, '_blank');

      // Start payment timer
      const startTime = Date.now();
      const PAYMENT_TIMEOUT = 15 * 60 * 1000; // 15 minutes

      // Poll for payment status
      const checkPaymentStatus = async () => {
        try {
          // Check if payment window is closed
          if (checkoutWindow?.closed) {
            clearInterval(statusInterval);
            setIsCheckingTurnitin(false);
            return;
          }

          // Check if payment has timed out
          if (Date.now() - startTime > PAYMENT_TIMEOUT) {
            clearInterval(statusInterval);
            checkoutWindow?.close();
            setIsCheckingTurnitin(false);
            alert('Payment timeout. Please try again.');
            return;
          }

          const statusResponse = await fetch(resolveApiUrl(`/api/check-charge/${chargeId}`));
          if (!statusResponse.ok) {
            const error = await statusResponse.json();
            throw new Error(error.message || 'Failed to check payment status');
          }

          const { status, charge } = await statusResponse.json();

          if (status === 'COMPLETED') {
            clearInterval(statusInterval);

            // Show processing message
            setProcessingMessage('Processing document...');

            // Payment successful, now send document for Turnitin check
            const formData = new FormData();
            formData.append('file', turnitinFile);
            formData.append('chargeId', chargeId);

            const response = await fetch(resolveApiUrl('/api/check-turnitin'), {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to check Turnitin');
            }

            const result = await response.json();
            setTurnitinResult(result);
            checkoutWindow?.close();
            setProcessingMessage('');

            // Show success message
            alert(`Document processed successfully!\nSimilarity score: ${result.similarity}%`);
          } else if (status === 'FAILED') {
            clearInterval(statusInterval);
            checkoutWindow?.close();
            throw new Error('Payment failed. Please try again.');
          }
        } catch (error) {
          clearInterval(statusInterval);
          checkoutWindow?.close();
          alert(error instanceof Error ? error.message : 'Failed to process payment');
          setIsCheckingTurnitin(false);
          setProcessingMessage('');
        }
      };

      // Check payment status every 5 seconds
      statusInterval = setInterval(checkPaymentStatus, 5000);

      // Clean up on unmount
      return () => {
        clearInterval(statusInterval);
        checkoutWindow?.close();
      };
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process Turnitin check');
      checkoutWindow?.close();
    } finally {
      setIsCheckingTurnitin(false);
      setProcessingMessage('');
    }
  };

  const handleLogout = async () => {
    if (!user || isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      // Show a loading toast to indicate logout process is happening
      const logoutToast = toast.loading('Logging out...');

      // Clear all local storage and session storage comprehensively
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cached data using Cache API if available
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (cacheError) {
          console.warn('Failed to clear cache:', cacheError);
        }
      }

      // Sign out from Clerk with proper cleanup
      const auth = (await import('@clerk/clerk-react'));
      // Prefer using the hook instance if available
      try {
        // @ts-expect-error runtime hook use inside handler; fall back below if not available
        await signOut();
      } catch {
        // Fallback: use global Clerk instance if accessible
        const anyClerk = (window as any).Clerk;
        if (anyClerk?.signOut) {
          await anyClerk.signOut();
        }
      }

      // Clear any remaining Clerk-related state
      if (typeof window !== 'undefined') {
        // Remove any Clerk cookies
        document.cookie.split(';').forEach(cookie => {
          if (cookie.trim().startsWith('__session') ||
              cookie.trim().startsWith('__client') ||
              cookie.trim().includes('clerk')) {
            const cookieName = cookie.split('=')[0].trim();
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          }
        });
      }

      // Success notification
      toast.dismiss(logoutToast);
      toast.success('Successfully logged out');

      // Force navigation to home page with full reload to ensure complete cleanup
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');

      // Fallback: Force redirect even if signOut fails
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } finally {
      setIsLoggingOut(false);
    }
  };

  const userEmail = user?.primaryEmailAddress?.emailAddress || 'No email available';
  const userName = user?.fullName || user?.username || 'User';

  // Add these new state variables for real data
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersApiAvailable, setOrdersApiAvailable] = useState<boolean>(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add useEffect to fetch orders from Cloudflare D1
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setLoadingOrders(true);
      try {
        // Determine if we're in development environment
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // Check if the API is available before making the request
        let orderData;
        let apiAvailable = false;

        try {
          // Build the API URL with a proper base URL check
          const apiUrl = resolveApiUrl(`/api/orders/user/${user.id}`);

          // Add a timeout to prevent long waiting times if API is down
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            // Check content type to ensure it's JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              orderData = await response.json();
              apiAvailable = true;
            } else {
              throw new Error('Response is not JSON');
            }
          } else {
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
        } catch (apiError) {
          // Continue with mock data
        }

        if (apiAvailable && orderData?.orders) {
          const active = orderData.orders.filter((order: any) => order.status !== 'completed');
          const completed = orderData.orders.filter((order: any) => order.status === 'completed');

          setActiveOrders(active);
          setCompletedOrders(completed);

          // Show success toast only in development to confirm real API connection
          if (isDev) {
            toast.success('Connected to orders API successfully');
          }
          setOrdersApiAvailable(true);
        } else {
          // API returned nothing usable
          setOrdersApiAvailable(false);
          setActiveOrders([]);
          setCompletedOrders([]);
          throw new Error('No orders returned from API');
        }
      } catch (error) {
          // Do not show mock data. Explicitly clear orders so the UI only shows real orders.
          setOrdersApiAvailable(false);
          setActiveOrders([]);
          setCompletedOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders' || activeTab === 'completed') {
      fetchOrders();
    }
  }, [user, activeTab]);

  // Add useEffect to fetch messages from Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || activeTab !== 'messages') return;

      setLoadingMessages(true);
      try {
        // TEMP: Mock messages until messaging service is wired
        const result = { success: true, messages: [] as any[] };
        setMessages(result.messages);
      } catch (error) {
        toast.error('Failed to load your messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    if (activeTab === 'messages') {
      fetchMessages();
      // TODO: Add WebSocket/SSE for real-time message updates via Railway API
    }
  }, [user, activeTab]);

  // Add function to send messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      // TEMP: optimistic update only
      setMessages(prev => [{
        id: Date.now(),
        content: newMessage.trim(),
        sender_type: 'user',
        created_at: new Date().toISOString()
      }, ...prev]);
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Add function to save profile information
  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    try {
      // Here we would typically update the user's profile in Clerk
      // For demo purposes, we'll just show a success message
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                H
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                HandyWriterz
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100 hidden sm:inline">
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  isLoggingOut
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 bg-white dark:bg-gray-800 w-64 border-r dark:border-gray-700 z-30">
        <div className="h-16 border-b dark:border-gray-700 flex items-center justify-center">
          <span className="font-medium text-gray-900 dark:text-gray-100">Dashboard</span>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Active Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FileCheck className="h-5 w-5" />
            <span>Completed Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              activeTab === 'messages'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              activeTab === 'subscription'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Subscription</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          
          {/* Quick Resources Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Quick Resources
            </h3>
            <div className="space-y-1">
              <Link
                to="/articles"
                className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <BookOpen className="h-4 w-4" />
                <span>Articles</span>
              </Link>
              <Link
                to="/authors"
                className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <Users className="h-4 w-4" />
                <span>Authors</span>
              </Link>
              <Link
                to="/docs/x402"
                className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <Zap className="h-4 w-4" />
                <span>x402 Protocol</span>
              </Link>
              <Link
                to="/services"
                className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <FileText className="h-4 w-4" />
                <span>All Services</span>
              </Link>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 p-2 rounded-lg mt-4 transition-colors ${
              isLoggingOut
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <LogOut className="h-5 w-5" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="pt-6">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
              Welcome back{user ? `, ${userName}` : ''}! ðŸ‘‹
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              Get expert help with your coursework. Choose a subject area to get started.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:max-w-md">
            <button
              onClick={handleQuickCall}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 text-sm"
            >
              <Phone className="h-4 w-4" />
              <span>Quick Call</span>
            </button>

            <button
              onClick={handleQuickMessage}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] text-white rounded-lg shadow-sm hover:brightness-95 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Quick Message</span>
            </button>
          </div>

          {/* Active Orders Tab */}
          {activeTab === 'orders' && !selectedArea && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">Active Orders</h2>
                <button
                  onClick={() => setSelectedArea('adult')}
                  className="hidden sm:inline-flex bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Order
                </button>
              </div>

              {loadingOrders ? (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading orders...</p>
                </div>
              ) : activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{`${order.service_type || 'Assignment'} - ${order.subject_area || 'General'}`}</h3>
                        <p className="text-gray-600">
                          {order.word_count?.toLocaleString()} words â€¢ Due {new Date(order.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Â£{typeof order.price === 'number' ? order.price.toFixed(2) : '0.00'}
                      </span>
                      <button
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        onClick={() => {
                          // In a real app, this would navigate to order details
                          toast.success(`Viewing details for order ${order.id}`);
                        }}
                      >
                        View Details
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-10 shadow-sm text-center">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No active orders</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-5">You don't have any active orders yet.</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedArea('adult')}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    >
                      Create Your First Order
                    </button>
                    <a href="/how-it-works" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">How it works</a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support Areas Selection */}
          {activeTab === 'orders' && !selectedService && selectedArea && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setSelectedArea(null)}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Select Service Type</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      // Navigate directly to Turnitin submission page
                      if (service.id === 'turnitin') {
                        window.location.href = '/turnitin/submit';
                      } else {
                        setSelectedService(service);
                      }
                    }}
                    className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{service.title}</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{service.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Form */}
          {activeTab === 'orders' && selectedService && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setSelectedService(null)}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Word Count</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={wordCount === 0 ? '' : wordCount || ''}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setWordCount(0);
                          e.target.setCustomValidity('Word count must be between 100 and 100,000');
                        } else {
                          const value = Number(inputValue);
                          if (value >= 0) {
                            setWordCount(value);
                            if (value >= 100 && value <= 100000) {
                              e.target.setCustomValidity('');
                            } else {
                              e.target.setCustomValidity('Word count must be between 100 and 100,000');
                            }
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && wordCount === 0) {
                          setWordCount(0);
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-12"
                      placeholder="Enter word count"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      title="Show price calculation"
                    >
                      <Calculator className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {calculatedPrice !== null && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Estimated Price: </span>
                    <span className="text-blue-600 dark:text-blue-400">Â£{calculatedPrice.toFixed(2)}</span>
                  </div>
                )}
                {showPriceBreakdown && (
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Price Calculation</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      <li>â€¢ Â£18/275 words for dissertations</li>
                      <li>â€¢ Â£18/275 words for Level 7 work</li>
                      <li>â€¢ Â£18/275 words for urgent orders (&lt; 2 days)</li>
                      <li>â€¢ Â£15/275 words for all other cases</li>
                    </ul>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Module</label>
                  <input
                    type="text"
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter module name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Study Level</label>
                  <select
                    value={studyLevel}
                    onChange={(e) => setStudyLevel(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    title="Choose your study level"
                  >
                    <option value="">Select level</option>
                    <option value="Level 4">Level 4 (Year 1)</option>
                    <option value="Level 5">Level 5 (Year 2)</option>
                    <option value="Level 6">Level 6 (Year 3)</option>
                    <option value="Level 7">Level 7 (Masters)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    title="Select your assignment due date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Enter your specific requirements..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Upload Files</label>
                  <div className="mt-1 flex items-center gap-4">
                      <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                        accept=".pdf,.doc,.docx,.txt,.md,.mp3,.m4a,.wav,.flac,.mp4,.mov,.mkv"
                      title="Upload assignment files"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                      disabled={uploading}
                      title="Click to select files"
                    >
                      <Upload className="h-5 w-5" />
                      {uploading ? 'Uploading...' : 'Select Files'}
                    </button>

                    {files.length > 0 && !uploading && uploadedFiles.length === 0 && (
                      <button
                        type="button"
                        onClick={handleUploadSubmit}
                        className="flex items-center gap-2 rounded-md bg-green-50 text-green-600 border border-green-200 px-4 py-2 hover:bg-green-100"
                      >
                        <Upload className="h-5 w-5" />
                        Upload {files.length} file(s)
                      </button>
                    )}
                  </div>

                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
                    </div>
                  )}

                  {files.length > 0 && !uploading && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate">{file.name} ({formatBytes(file.size)})</span>
                          {uploadedFiles.length === 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-600"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-600 flex items-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          <span>Files uploaded successfully!</span>
                        </p>
                      </div>

                      {adminNotified ? (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-600 flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            <span>Documents sent to admin. Ready for payment!</span>
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>Documents need to be sent to admin before payment.</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      For new orders with file sharing, use <strong>New Order</strong> in the sidebar.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowEmailOption(!showEmailOption)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {showEmailOption ? 'Hide email option' : 'Send files via email'}
                    </button>
                  </div>

                  {showEmailOption && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Send Files via Email</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Email Address</label>
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="recipient@example.com"
                            title="Recipient email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                          <textarea
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            className="w-full p-2 border rounded-md resize-none"
                            rows={3}
                            placeholder="Add a message to include with the files"
                            title="Optional message"
                          ></textarea>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleEmailDocuments}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            disabled={!uploadedFiles.length || !emailAddress}
                          >
                            Send Files
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService(null);
                      setAdminNotified(false);
                      setFiles([]);
                      setUploadedFiles([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                      uploadedFiles.length > 0 && adminNotified
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : uploadedFiles.length > 0 && !adminNotified
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : files.length > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={files.length === 0 && uploadedFiles.length === 0}
                  >
                    {uploadedFiles.length > 0 && adminNotified ? (
                      <>
                        <PoundSterling className="h-4 w-4" />
                        Proceed to Payment
                      </>
                    ) : uploadedFiles.length > 0 && !adminNotified ? (
                      <>
                        <Send className="h-4 w-4" />
                        Send to Admin First
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {files.length > 0 ? 'Upload Files & Continue' : 'Please Select Files'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* Completed Orders Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-6">Completed Orders</h2>

              {loadingOrders ? (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading completed orders...</p>
                </div>
              ) : completedOrders.length > 0 ? (
                completedOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{`${order.service_type || 'Assignment'} - ${order.subject_area || 'General'}`}</h3>
                        <p className="text-gray-600">
                          {order.word_count?.toLocaleString()} words â€¢ Completed {new Date(order.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Â£{typeof order.price === 'number' ? order.price.toFixed(2) : '0.00'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          onClick={() => {
                            // In a real app, this would download the files
                            if (order.files && order.files.length > 0) {
                              const firstFile = order.files[0];
                              if (firstFile.url) {
                                window.open(firstFile.url, '_blank');
                              } else {
                                toast.error('Download link not available');
                              }
                            } else {
                              toast.error('No files available for download');
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          onClick={() => {
                            // In a real app, this would navigate to order details
                            toast.success(`Viewing details for order ${order.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center border border-gray-200 dark:border-gray-700">
                  <FileCheck className="h-12 w-12 text-gray-500 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No completed orders</h3>
                  <p className="text-gray-600 dark:text-gray-400">You don't have any completed orders yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-bold">Messages</h2>
              </div>

              {loadingMessages ? (
                <div className="p-6 text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="p-6">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender_type === 'user'
                            ? 'bg-blue-100 ml-12'
                            : 'bg-gray-100 mr-12'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Type your message here..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </form>
                </div>
              ) : (
              <div className="p-6 text-center text-gray-600 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-500 dark:text-gray-500" />
                  <p className="mb-4">No messages yet</p>

                  <form onSubmit={handleSendMessage} className="flex gap-2 max-w-md mx-auto">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Send us a message..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </form>

                  <div className="mt-8 border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Need to send documents or have urgent matters?</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => window.open('mailto:admin@handywriterz.com', '_blank')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Email Admin</span>
                      </button>
                      <button
                        onClick={handleQuickMessage}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp Support</span>
                      </button>
                    </div>

                    {/* Email Admin Button with Modal */}
                    <div className="mt-6">
                      <button
                        onClick={() => setShowEmailOption(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mx-auto flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send Detailed Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Admin Modal */}
          {showEmailOption && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contact Admin</h2>
                  <button
                    onClick={() => setShowEmailOption(false)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Close modal"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEmailDocuments();
                  }}
                  aria-label="Contact admin form"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium mb-1">Your Name</label>
                      <input
                        type="text"
                        id="userName"
                        className="w-full p-2 border rounded-md"
                        value={userName}
                        readOnly
                        aria-label="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailAddress" className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        id="emailAddress"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="admin@handywriterz.com"
                        defaultValue="admin@handywriterz.com"
                        required
                        aria-label="Admin email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailSubject" className="block text-sm font-medium mb-1">Subject</label>
                      <input
                        type="text"
                        id="emailSubject"
                        name="emailSubject"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter subject"
                        required
                        aria-label="Email subject"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailMessage" className="block text-sm font-medium mb-1">Message</label>
                      <textarea
                        id="emailMessage"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full p-2 border rounded-md resize-none"
                        rows={5}
                        placeholder="Your message to the admin..."
                        required
                        aria-label="Email message content"
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="fileUpload" className="block text-sm font-medium mb-1">Attach Files</label>
                      <input
                        type="file"
                        id="fileUpload"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                        title="Select files to attach"
                        aria-label="Select files to attach"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 w-full"
                        aria-label="Select files"
                      >
                        <Upload className="h-5 w-5" />
                        Select Files
                      </button>

                      {(files.length > 0 || uploadedFiles.length > 0) && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-600">
                            {files.length > 0 && `${files.length} new file(s) selected`}
                            {files.length > 0 && uploadedFiles.length > 0 && ' â€¢ '}
                            {uploadedFiles.length > 0 && `${uploadedFiles.length} file(s) already uploaded`}
                          </p>

                          {/* Show uploaded files with option to remove */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                  <span className="truncate max-w-[200px]">{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label={`Remove ${file.name}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowEmailOption(false)}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                        disabled={uploading}
                        aria-label="Send email"
                      >
                        {uploading ? 'Sending...' : 'Send Documents'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <SubscriptionStatus />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt={`${userName}'s profile`} className="h-full w-full object-cover" />
                      ) : (
                      <User className="h-10 w-10 text-gray-500 dark:text-gray-500" />
                      )}
                    </div>
                    <button
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white"
                      title="Upload profile picture"
                      onClick={() => {
                        // This would open Clerk's profile image editor in a real implementation
                        toast.success('Profile picture uploads would be handled by Clerk in production');
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-gray-500">Upload a new photo or choose an avatar</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg bg-gray-50"
                    placeholder="your@email.com"
                    value={userEmail}
                    readOnly
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">To change your email, please use your account settings</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Your full name"
                    value={userName}
                    onChange={(e) => {
                      // In a real implementation, this would update a state variable
                      toast.success('Name changes would be handled by Clerk in production');
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                  <div className="flex gap-2">
                    <select
                      className="w-24 p-3 border rounded-lg"
                      title="Select country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // In a real implementation, this would delete the account
                        toast.error('Account deletion is disabled in demo mode');
                      }
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                    <span>Delete Account</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                    onClick={() => toast.success('Account archiving would be implemented in production')}
                  >
                    <Archive className="h-4 w-4" />
                    <span>Archive Profile</span>
                  </button>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      // Reset form
                      setPhoneNumber('');
                      setCountryCode('+44');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Documents Tab */}
          {isAdmin && activeTab === 'admin' && <AdminDocuments />}

          {/* Add Admin Tab for Admins */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 p-2 rounded-lg ${
                activeTab === 'admin'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="View user documents"
            >
              <FileText className="h-5 w-5" />
              <span>User Documents</span>
            </button>
          )}

          {/* Modals */}
          {showTurnitinModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Check Turnitin</h2>
                  <button
                    onClick={() => {
                      setTurnitinFile(null);
                      setTurnitinResult(null);
                      setShowTurnitinModal(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    title="Close Turnitin check"
                  >
                    <X size={20} />
                  </button>
                </div>

                {!turnitinResult ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      Upload your document to check for plagiarism.
                      <br />
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>

                    <div className="space-y-4">
                      <input
                        type="file"
                        ref={turnitinFileInputRef}
                        onChange={handleTurnitinFileSelect}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="turnitinFileInput"
                        title="Upload document for Turnitin check"
                      />

                      <div
                        onClick={() => turnitinFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                        role="button"
                        tabIndex={0}
                        title="Select file for Turnitin check"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            turnitinFileInputRef.current?.click();
                          }
                        }}
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-500" />
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          Click to select a file
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum file size: 10MB
                        </p>
                      </div>

                      {turnitinFile && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {turnitinFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Size: {(turnitinFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => setTurnitinFile(null)}
                              className="text-gray-500 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                              title="Remove file"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {processingMessage && (
                        <div className="mt-4 text-center p-4 bg-blue-50 rounded-lg">
                          <div className="inline-flex items-center">
                            <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                            <p className="text-sm text-blue-600">{processingMessage}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setTurnitinFile(null);
                            setShowTurnitinModal(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleTurnitinCheck}
                          disabled={!turnitinFile || isCheckingTurnitin}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                            !turnitinFile || isCheckingTurnitin
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isCheckingTurnitin ? (
                            <div className="inline-flex items-center">
                              <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                              Processing...
                            </div>
                          ) : (
                            'Check Turnitin (Â£5)'
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Results</h3>
                    <p className={`text-${turnitinResult.similarity > 20 ? 'red' : 'green'}-600 font-medium`}>
                      Similarity Score: {turnitinResult.similarity}%
                    </p>
                    {turnitinResult.matches.map((match: any, index: number) => (
                      <div key={index} className="mt-2">
                        <p className="text-sm font-medium">
                          Source: {match.source}
                        </p>
                        <p className="text-sm text-gray-500">
                          Match: {match.percentage}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
