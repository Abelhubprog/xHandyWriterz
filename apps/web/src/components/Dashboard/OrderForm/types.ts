/**
 * Order Form Types
 */

export interface SupportArea {
  id: string;
  title: string;
  icon?: string;
}

export interface ServiceType {
  id: string;
  title: string;
  desc: string;
  icon?: string;
}

export interface OrderFormData {
  selectedArea: string | null;
  selectedService: ServiceType | null;
  wordCount: number;
  studyLevel: string;
  dueDate: string;
  module: string;
  instructions: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  path: string;
  size?: number;
  contentType?: string;
}

export interface PriceFactors {
  wordCount: number;
  serviceId: string;
  studyLevel: string;
  dueDate: string;
}

export interface OrderPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  orderDetails: {
    serviceType: string;
    subjectArea: string;
    wordCount: number;
    studyLevel: string;
    dueDate: string;
    module: string;
    instructions: string;
  };
  files: UploadedFile[];
}

export const SUPPORT_AREAS: SupportArea[] = [
  { id: 'adult', title: 'Adult Health Nursing', icon: '👨‍⚕️' },
  { id: 'mental', title: 'Mental Health Nursing', icon: '🧠' },
  { id: 'child', title: 'Child Nursing', icon: '👶' },
  { id: 'disability', title: 'Disability Nursing', icon: '♿' },
  { id: 'social', title: 'Social Work', icon: '🤝' },
  { id: 'special', title: 'Special Education Needs', icon: '📚' },
];

export const SERVICE_TYPES: ServiceType[] = [
  { id: 'dissertation', title: 'Dissertation', desc: 'Expert dissertation writing support', icon: '📖' },
  { id: 'essays', title: 'Essays', desc: 'Professional essay writing', icon: '✍️' },
  { id: 'reflection', title: 'Placement Reflections', desc: 'Clinical reflection writing', icon: '📝' },
  { id: 'reports', title: 'Reports', desc: 'Detailed academic reports', icon: '📊' },
  { id: 'portfolio', title: 'E-Portfolio', desc: 'Portfolio development', icon: '💼' },
  { id: 'turnitin', title: 'Turnitin Check', desc: 'Plagiarism detection & originality report', icon: '🔍' },
];

export const STUDY_LEVELS = [
  { value: 'Level 4', label: 'Level 4 (Year 1)' },
  { value: 'Level 5', label: 'Level 5 (Year 2)' },
  { value: 'Level 6', label: 'Level 6 (Year 3)' },
  { value: 'Level 7', label: 'Level 7 (Masters)' },
];
