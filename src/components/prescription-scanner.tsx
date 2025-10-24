
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, RefreshCw, Send, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrescriptionScannerProps {
  onCapture: (image: string) => void;
}

export function PrescriptionScanner({ onCapture }: PrescriptionScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        // We only request permission, but don't keep the stream active
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        // We don't toast here anymore, to allow users to proceed with file upload
      }
    };

    getCameraPermission();
  }, []);
  

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleRetake = () => {
    setImage(null);
  };

  const handleSend = async () => {
    if (image) {
      setIsProcessing(true);
      await onCapture(image);
      setIsProcessing(false);
    }
  };

  if (hasCameraPermission === null) {
      return (
          <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Checking camera permissions...</p>
          </div>
      )
  }


  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full aspect-video rounded-md overflow-hidden border bg-muted relative">
        {image ? (
          <img src={image} alt="Captured prescription" className="w-full h-full object-contain" />
        ) : (
          hasCameraPermission ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: 'environment' }}
            />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                <Camera className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">Camera access is not available.</p>
                <p className="text-sm text-muted-foreground text-center">Please enable it in your browser settings or upload a file.</p>
            </div>
          )
        )}
      </div>
      <div className="flex gap-4">
        {image ? (
          <>
            <Button variant="outline" onClick={handleRetake} disabled={isProcessing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button onClick={handleSend} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Use this Image'}
            </Button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={capture} size="lg" disabled={!hasCameraPermission}>
              <Camera className="mr-2 h-4 w-4" />
              Capture Photo
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <Button onClick={handleUploadClick} variant="secondary" size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload an Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
