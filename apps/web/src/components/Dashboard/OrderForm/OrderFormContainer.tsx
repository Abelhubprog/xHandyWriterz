/**
 * Order Form Container
 * Main orchestrator for the multi-step order creation flow
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import useDocumentSubmission from '@/hooks/useDocumentSubmission';
import { cn } from '@/lib/utils';
import { SupportAreaSelector } from './SupportAreaSelector';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { OrderDetailsForm } from './OrderDetailsForm';
import { OrderSummary } from './OrderSummary';
import { calculatePrice } from './PriceCalculator';
import { SUPPORT_AREAS, type ServiceType, type UploadedFile, type OrderPaymentData } from './types';

type Step = 'area' | 'service' | 'details' | 'summary';

interface OrderFormContainerProps {
  className?: string;
}

export function OrderFormContainer({ className }: OrderFormContainerProps) {
  const navigate = useNavigate();
  const { user } = useUser();

  // Form state
  const [step, setStep] = useState<Step>('area');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [studyLevel, setStudyLevel] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState('');
  const [instructions, setInstructions] = useState('');

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [adminNotified, setAdminNotified] = useState(false);

  // Document submission hook
  const { submitDocuments, status: submissionStatus } = useDocumentSubmission({
    onSuccess: (_submissionId, attachments) => {
      const uploaded = attachments.map((att) => ({
        name: att.filename,
        url: att.r2Key,
        path: att.r2Key,
      }));
      setUploadedFiles(uploaded);
      setAdminNotified(true);
      setUploading(false);
      setFiles([]);
      toast.success('Documents uploaded and sent to admin!');
      setStep('summary');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to upload documents');
      setUploading(false);
    },
  });

  // Calculate price
  const calculatedPrice = React.useMemo(() => {
    if (!wordCount || !studyLevel || !dueDate || !selectedService) {
      return null;
    }
    return calculatePrice({
      wordCount,
      serviceId: selectedService.id,
      studyLevel,
      dueDate,
    });
  }, [wordCount, studyLevel, dueDate, selectedService]);

  // Step handlers
  const handleAreaSelect = useCallback((areaId: string) => {
    setSelectedArea(areaId);
    setStep('service');
  }, []);

  const handleServiceSelect = useCallback((service: ServiceType) => {
    setSelectedService(service);
    setStep('details');
  }, []);

  const handleBackToArea = useCallback(() => {
    setSelectedService(null);
    setStep('area');
  }, []);

  const handleBackToService = useCallback(() => {
    setStep('service');
  }, []);

  const handleBackToDetails = useCallback(() => {
    setStep('details');
  }, []);

  // Form submission
  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (files.length === 0 && uploadedFiles.length === 0) {
        toast.error('Please upload at least one file');
        return;
      }

      if (!user) {
        toast.error('Please sign in to continue');
        navigate('/sign-in');
        return;
      }

      // If already uploaded, go to summary
      if (uploadedFiles.length > 0 && adminNotified) {
        setStep('summary');
        return;
      }

      // Upload files
      setUploading(true);
      const metadata = {
        serviceType: selectedService?.title || '',
        subjectArea: SUPPORT_AREAS.find((a) => a.id === selectedArea)?.title || '',
        wordCount,
        studyLevel,
        dueDate,
        module,
        instructions,
        userEmail: user.primaryEmailAddress?.emailAddress || '',
        userName: user.fullName || user.username || '',
      };

      await submitDocuments(files, metadata);
    },
    [
      files,
      uploadedFiles,
      adminNotified,
      user,
      navigate,
      selectedService,
      selectedArea,
      wordCount,
      studyLevel,
      dueDate,
      module,
      instructions,
      submitDocuments,
    ]
  );

  // Navigate to payment
  const handleProceedToPayment = useCallback(() => {
    if (!selectedService || !calculatedPrice) {
      toast.error('Missing order information');
      return;
    }

    const paymentData: OrderPaymentData = {
      orderId: `ORD-${Date.now()}`,
      amount: calculatedPrice,
      currency: 'GBP',
      orderDetails: {
        serviceType: selectedService.title,
        subjectArea: SUPPORT_AREAS.find((a) => a.id === selectedArea)?.title || '',
        wordCount,
        studyLevel,
        dueDate,
        module,
        instructions,
      },
      files: uploadedFiles,
    };

    navigate('/payment', { state: { paymentData } });
  }, [
    selectedService,
    calculatedPrice,
    selectedArea,
    wordCount,
    studyLevel,
    dueDate,
    module,
    instructions,
    uploadedFiles,
    navigate,
  ]);

  // File handlers
  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setAdminNotified(false);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setAdminNotified(false);
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Indicator */}
      <StepIndicator currentStep={step} />

      {/* Step Content */}
      {step === 'area' && (
        <SupportAreaSelector
          selectedArea={selectedArea}
          onSelect={handleAreaSelect}
        />
      )}

      {step === 'service' && (
        <ServiceTypeSelector
          selectedService={selectedService}
          onSelect={handleServiceSelect}
          onBack={handleBackToArea}
        />
      )}

      {step === 'details' && selectedService && (
        <OrderDetailsForm
          service={selectedService}
          wordCount={wordCount}
          studyLevel={studyLevel}
          dueDate={dueDate}
          module={module}
          instructions={instructions}
          files={files}
          uploadedFiles={uploadedFiles}
          uploading={uploading}
          adminNotified={adminNotified}
          onWordCountChange={setWordCount}
          onStudyLevelChange={setStudyLevel}
          onDueDateChange={setDueDate}
          onModuleChange={setModule}
          onInstructionsChange={setInstructions}
          onFilesChange={handleFilesChange}
          onRemoveFile={handleRemoveFile}
          onBack={handleBackToService}
          onSubmit={handleFormSubmit}
        />
      )}

      {step === 'summary' && selectedService && (
        <OrderSummary
          formData={{
            selectedArea,
            selectedService,
            wordCount,
            studyLevel,
            dueDate,
            module,
            instructions,
          }}
          uploadedFiles={uploadedFiles}
          calculatedPrice={calculatedPrice}
          onEdit={handleBackToDetails}
          onProceed={handleProceedToPayment}
        />
      )}
    </div>
  );
}

interface StepIndicatorProps {
  currentStep: Step;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps: { key: Step; label: string }[] = [
    { key: 'area', label: 'Subject' },
    { key: 'service', label: 'Service' },
    { key: 'details', label: 'Details' },
    { key: 'summary', label: 'Review' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between max-w-md mx-auto">
      {steps.map((s, idx) => {
        const isActive = idx === currentIndex;
        const isComplete = idx < currentIndex;

        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
              >
                {isComplete ? '✓' : idx + 1}
              </div>
              <span
                className={cn(
                  'text-xs mt-1',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  idx < currentIndex
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default OrderFormContainer;
