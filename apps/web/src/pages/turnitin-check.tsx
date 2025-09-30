import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { env } from '@/env';

type UploadedFile = { r2Key: string; filename: string; size: number; contentType: string };

const TurnitinCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const brokerUrl = useMemo(() => env.VITE_UPLOAD_BROKER_URL?.replace(/\/$/, '') ?? '', []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const list = Array.from(e.target.files);
    if (list.length + files.length > 5) {
      toast.error('You can upload up to 5 attachments.');
      return;
    }
    setFiles(prev => [...prev, ...list]);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const startPayment = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (files.length === 0) {
      toast.error('Attach at least one document');
      return;
    }

    try {
      setUploading(true);
      const uploaded: UploadedFile[] = [];
      if (!brokerUrl) throw new Error('Upload broker not configured. Set VITE_UPLOAD_BROKER_URL');
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const key = `turnitin/${Date.now()}-${safeName}`;
        const presignRes = await fetch(`${brokerUrl}/s3/presign-put`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
        });
        if (!presignRes.ok) throw new Error(await presignRes.text().catch(() => 'Failed to presign upload'));
        const { url } = await presignRes.json();
        if (!url) throw new Error('Upload URL missing');
        const put = await fetch(url, { method: 'PUT', body: file, headers: { 'content-type': file.type || 'application/octet-stream' } });
        if (!put.ok) throw new Error(await put.text().catch(() => 'Failed to upload file'));
        uploaded.push({ r2Key: key, filename: file.name, size: file.size, contentType: file.type });
      }

      const orderId = uuidv4();
      const submission = { kind: 'turnitin', orderId, email, notes, attachments: uploaded };
      localStorage.setItem(`turnitin:${orderId}`, JSON.stringify(submission));

      navigate('/payment', { state: {
        paymentData: {
          orderId,
          amount: 9.99, // default fee; can be adjusted dynamically
          currency: 'USD',
          orderDetails: {
            serviceType: 'Turnitin Check',
            subjectArea: 'General',
            wordCount: 0,
            studyLevel: 'N/A',
            dueDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
            module: 'Check',
            instructions: notes,
          },
          files: uploaded.map(f => ({ name: f.filename, url: '', path: f.r2Key }))
        }
      }});
    } catch (e: any) {
      toast.error(e?.message || 'Failed to prepare payment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Check Turnitin</CardTitle>
          <CardDescription>Upload up to 5 documents. No login required.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Your Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any instructions..." />
            </div>
            <div>
              <Label>Attachments (1-5)</Label>
              <Input type="file" multiple accept=".pdf,.doc,.docx,.txt,.rtf" onChange={onFileChange} />
              <ul className="mt-2 text-sm text-gray-700">
                {files.map((f, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>{f.name} ({Math.round(f.size/1024)} KB)</span>
                    <button className="text-red-600 text-xs" onClick={() => removeFile(idx)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2">
              <Button disabled={uploading} onClick={startPayment} className="w-full">
                {uploading ? 'Preparing…' : 'Continue to Payment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnitinCheckPage;
