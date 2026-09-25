import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Camera, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPathForUser } from '../lib/navigation';
import { User } from '../types';

export const FaceLoginPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [streamReady, setStreamReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [captureProgress, setCaptureProgress] = useState<string | null>(null);
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

  const handleMultiFrameFaceLogin = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Unable to prepare camera frame.');
      setLoading(false);
      return;
    }

    const frameBlobs: Blob[] = [];
    const TOTAL_FRAMES = 5;

    try {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        setCaptureProgress(`Capturing frame ${i} of ${TOTAL_FRAMES} for consensus verification…`);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        frameBlobs.push(blob);

        // Wait 350ms between frame captures
        if (i < TOTAL_FRAMES) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      setCaptureProgress('Running AI consensus matching against database…');

      const formData = new FormData();
      frameBlobs.forEach((blob, idx) => {
        formData.append('files', blob, `login-frame-${idx + 1}.png`);
      });

      const response = await api.post('/auth/face-login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { access_token, refresh_token, user } = response.data as {
        access_token: string;
        refresh_token: string;
        user: User;
      };

      setSession(access_token, refresh_token, user);
      setMessage('Face match verified with high confidence! Redirecting…');
      setTimeout(() => navigate(getDashboardPathForUser(user)), 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Face verification failed. Please ensure your face is enrolled and well-lit.');
    } finally {
      setLoading(false);
      setCaptureProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Activity className="w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelli<span className="text-sky-600">Med</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Multi-Frame Face Sign-In</h2>
          <p className="text-xs text-slate-500">Sign in securely using multi-frame consensus face matching.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes('enroll') && (
                <div className="pl-6">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sky-600 hover:underline font-semibold"
                  >
                    → Log in with email & password to set up face login
                  </button>
                </div>
              )}
            </div>
          )}
          {message && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative">
            <video
              ref={videoRef}
              className={`w-full h-[320px] object-cover ${streamReady ? '' : 'hidden'}`}
              playsInline
              muted
            />

            {streamReady && !loading && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-emerald-400/80 rounded-full flex items-center justify-center bg-emerald-500/5 backdrop-blur-[1px]">
                  <span className="text-xs text-emerald-200 font-semibold px-3 py-1 rounded-full bg-slate-950/60">
                    Look Directly at Camera
                  </span>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 p-4 text-center">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-emerald-300">{captureProgress || 'Verifying face…'}</p>
                <span className="text-xs text-slate-400">Comparing 5 captured frames with security threshold</span>
              </div>
            )}

            {!streamReady && !loading && (
              <div className="h-[320px] flex items-center justify-center text-slate-300">
                {starting ? 'Starting camera…' : 'Camera inactive'}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button
            onClick={handleMultiFrameFaceLogin}
            disabled={loading || !streamReady}
            className="w-full btn-medical py-3.5 text-base font-semibold flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            {loading ? 'Verifying Face Consensus...' : 'Sign In With Face'}
          </button>

          <button onClick={() => navigate('/login')} className="w-full btn-outline py-3 text-xs flex items-center justify-center gap-2">
            Use Email and Password <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
