import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Camera, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';

interface AngleStep {
  id: string;
  label: string;
  instruction: string;
  hint: string;
}

const STEPS: AngleStep[] = [
  { id: 'center', label: 'Step 1 of 3: Front View', instruction: 'Look directly into the camera', hint: 'Keep your face centered and well-lit' },
  { id: 'left', label: 'Step 2 of 3: Left Angle', instruction: 'Turn your head slightly to the left', hint: 'Angle your head ~20° to the left' },
  { id: 'right', label: 'Step 3 of 3: Right Angle', instruction: 'Turn your head slightly to the right', hint: 'Angle your head ~20° to the right' },
];

export const FaceEnrollmentPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const [streamReady, setStreamReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedBlobs, setCapturedBlobs] = useState<{ stepId: string; blob: Blob; previewUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access.');
      return;
    }

    setStarting(true);
    setError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setStreamReady(true);
              setStarting(false);
            })
            .catch(() => {
              setError('Could not play video stream.');
              setStarting(false);
            });
        };

        videoRef.current.play()
          .then(() => {
            setStreamReady(true);
            setStarting(false);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setError(`Camera error: ${err.message || 'Access denied or camera unavailable'}`);
      setStreamReady(false);
      setStarting(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCaptureAngle = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const currentStep = STEPS[currentStepIndex];
    const newCaptured = [
      ...capturedBlobs,
      { stepId: currentStep.id, blob, previewUrl: dataUrl }
    ];
    setCapturedBlobs(newCaptured);

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setCapturedBlobs([]);
    setCurrentStepIndex(0);
    setError(null);
    setMessage(null);
  };

  const handleSubmitEnrollment = async () => {
    if (capturedBlobs.length < STEPS.length) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    capturedBlobs.forEach((item, index) => {
      formData.append('files', item.blob, `face-sample-${index + 1}-${item.stepId}.png`);
    });

    try {
      const res = await api.post('/auth/face-enroll', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message || 'Face enrolled successfully with 3-angle samples!');
      setTimeout(() => navigate('/dashboard/patient'), 1800);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Face enrollment failed. Please try capturing again.');
    } finally {
      setUploading(false);
    }
  };

  const isAllCaptured = capturedBlobs.length === STEPS.length;
  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Activity className="w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelli<span className="text-sky-600">Med</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Angle Face Enrollment</h2>
          <p className="text-xs text-slate-500">Capture 3 face angles (front, left, right) for reliable, secure identification.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl space-y-5">
          {/* Progress Indicators */}
          <div className="grid grid-cols-3 gap-3">
            {STEPS.map((step, idx) => {
              const isDone = idx < capturedBlobs.length;
              const isCurrent = idx === currentStepIndex && !isAllCaptured;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : isCurrent
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 text-sky-700 dark:text-sky-300 ring-2 ring-sky-400/30'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Camera className="w-4 h-4" />}
                    <span>Angle {idx + 1}</span>
                  </div>
                  <span className="text-[10px] block mt-0.5 font-medium truncate">{step.id.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Camera Feed with Overlay */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative">
            <video
              ref={videoRef}
              className={`w-full h-[320px] object-cover ${streamReady ? '' : 'hidden'}`}
              playsInline
              muted
            />

            {/* Oval Face Guide Overlay */}
            {streamReady && !isAllCaptured && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-sky-400/80 rounded-full flex items-center justify-center bg-sky-500/5 backdrop-blur-[1px]">
                  <span className="text-xs text-sky-200 font-semibold px-3 py-1 rounded-full bg-slate-950/60">
                    Position Face Here
                  </span>
                </div>
                <p className="text-white text-xs font-medium mt-3 bg-slate-950/70 px-4 py-1.5 rounded-full shadow">
                  {currentStep.instruction}
                </p>
              </div>
            )}

            {!streamReady && (
              <div className="h-[320px] flex items-center justify-center text-slate-300">
                {starting ? 'Starting camera…' : 'Camera inactive'}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isAllCaptured ? (
              <button
                onClick={handleCaptureAngle}
                disabled={!streamReady}
                className="w-full btn-primary py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Sample ({currentStep.label})
              </button>
            ) : (
              <button
                onClick={handleSubmitEnrollment}
                disabled={uploading}
                className="w-full btn-medical py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                {uploading ? 'Enrolling Face Samples...' : 'Submit All 3 Face Samples'}
              </button>
            )}

            {capturedBlobs.length > 0 && (
              <button
                onClick={handleReset}
                disabled={uploading}
                className="w-full btn-outline py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset & Recapture
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Minimum 3 samples required for secure sign-in</span>
            <button onClick={() => navigate('/dashboard/patient')} className="text-sky-600 hover:underline flex items-center gap-1 font-semibold">
              Skip for Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
