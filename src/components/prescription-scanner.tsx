'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, RefreshCw, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrescriptionScannerProps {
  onCapture: (image: string) => void;
}

export function PrescriptionScanner({ onCapture }: PrescriptionScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);
  

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  }, [webcamRef]);

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

  if (hasCameraPermission === false) {
    return (
      <Alert variant="destructive">
        <Camera className="h-4 w-4" />
        <AlertTitle>Camera Access Required</AlertTitle>
        <AlertDescription>
          This feature requires camera access. Please enable camera permissions in your browser settings and refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full aspect-video rounded-md overflow-hidden border bg-muted relative">
        {image ? (
          <img src={image} alt="Captured prescription" className="w-full h-full object-contain" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: 'environment' }}
          />
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
          <Button onClick={capture} size="lg">
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        )}
      </div>
    </div>
  );
}
