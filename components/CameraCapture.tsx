"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, CheckCircle2 } from "lucide-react";

interface CameraCaptureProps {
  onConfirm: (photoDataUrl: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onConfirm, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async (mode: "user" | "environment") => {
    stopCamera();
    setPermissionError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        setProcessing(true);
        setProcessingError(false);
        const dataUrlOriginal = canvas.toDataURL('image/jpeg', 0.9);
        setOriginalImage(dataUrlOriginal);
        
        try {
          // Dynamic import of the library to avoid SSR issues
          const imgly = await import('@imgly/background-removal');
          const removeBackground = imgly.removeBackground || imgly.default;
          
          const blob = await removeBackground(dataUrlOriginal);
          const img = new Image();
          img.onload = () => {
            const targetRatio = 3 / 4;
            const videoRatio = canvas.width / canvas.height;
            
            let cropWidth = canvas.width;
            let cropHeight = canvas.height;
            let cropX = 0;
            let cropY = 0;

            if (videoRatio > targetRatio) {
              cropWidth = canvas.height * targetRatio;
              cropX = (canvas.width - cropWidth) / 2;
            } else {
              cropHeight = canvas.width / targetRatio;
              cropY = (canvas.height - cropHeight) / 2;
            }
            
            const FINAL_WIDTH = 120;
              const FINAL_HEIGHT = 160;
              const croppedCanvas = document.createElement('canvas');
              croppedCanvas.width = FINAL_WIDTH;
              croppedCanvas.height = FINAL_HEIGHT;
              const croppedCtx = croppedCanvas.getContext('2d');
              
              if (croppedCtx) {
                // Fondo blanco
                croppedCtx.fillStyle = '#FFFFFF';
                croppedCtx.fillRect(0, 0, FINAL_WIDTH, FINAL_HEIGHT);
                
                // Dibujar la persona sin fondo
                croppedCtx.drawImage(
                  img, 
                  cropX, cropY, cropWidth, cropHeight, 
                  0, 0, FINAL_WIDTH, FINAL_HEIGHT
                );
                
                const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.6); 
              setCapturedImage(dataUrl);
              setProcessing(false);
            }
          };
          img.src = URL.createObjectURL(blob);
        } catch (err) {
          console.error("Error processing image:", err);
          setProcessingError(true);
          setProcessing(false);
        }
      }
    }
  };

  const processWithoutBackgroundRemoval = () => {
    if (originalImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const img = new Image();
      img.onload = () => {
        const targetRatio = 3 / 4;
        const videoRatio = img.width / img.height;
        
        let cropWidth = img.width;
        let cropHeight = img.height;
        let cropX = 0;
        let cropY = 0;

        if (videoRatio > targetRatio) {
          cropWidth = img.height * targetRatio;
          cropX = (img.width - cropWidth) / 2;
        } else {
          cropHeight = img.width / targetRatio;
          cropY = (img.height - cropHeight) / 2;
        }
        
        const FINAL_WIDTH = 120;
          const FINAL_HEIGHT = 160;
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = FINAL_WIDTH;
          croppedCanvas.height = FINAL_HEIGHT;
          const croppedCtx = croppedCanvas.getContext('2d');
          
          if (croppedCtx) {
            croppedCtx.drawImage(
              img, 
              cropX, cropY, cropWidth, cropHeight, 
              0, 0, FINAL_WIDTH, FINAL_HEIGHT
            );
            const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.6); 
          setCapturedImage(dataUrl);
          setProcessingError(false);
        }
      };
      img.src = originalImage;
    }
  };

  const retryPhoto = () => {
    setCapturedImage(null);
    setOriginalImage(null);
    setProcessingError(false);
    startCamera(facingMode);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onConfirm(capturedImage);
      stopCamera();
    }
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No podemos acceder a la cámara</h3>
          <p className="text-sm text-slate-500">Permite el acceso a la cámara en tu navegador para tomar la fotografía.</p>
          <div className="pt-4 space-y-3">
            <button onClick={() => startCamera(facingMode)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">
              Intentar Nuevamente
            </button>
            <button onClick={() => { stopCamera(); onCancel(); }} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Subir Fotografía (Cancelar)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in h-[100dvh] overflow-hidden">
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl w-full max-w-md h-full max-h-[90dvh] flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center shrink-0">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Camera size={16}/> {capturedImage ? "FOTO CAPTURADA" : "Captura de Fotografía"}
          </h3>
          <button onClick={() => { stopCamera(); onCancel(); }} className="text-slate-400 hover:text-white transition-colors p-1"><X size={20}/></button>
        </div>

        {/* FOTO AREA (RESPONSIVE) */}
        <div className="flex-1 min-h-0 bg-slate-900 relative flex items-center justify-center">
          {processing ? (
            <div className="flex flex-col items-center justify-center text-white space-y-4 px-6 text-center">
              <RefreshCw size={40} className="animate-spin text-emerald-500" />
              <div>
                <p className="font-bold text-lg mb-1">Procesando fotografía...</p>
                <p className="text-sm text-slate-400">Detectando persona y eliminando fondo con IA.</p>
              </div>
            </div>
          ) : processingError ? (
            <div className="flex flex-col items-center justify-center text-white space-y-4 px-6 text-center">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center">
                <X size={32} />
              </div>
              <div>
                <p className="font-bold text-lg text-amber-400 mb-1">No pudimos separar el fondo</p>
                <p className="text-sm text-slate-300">La segmentación automática ha fallado.</p>
              </div>
            </div>
          ) : !capturedImage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              ></video>
              
              {/* Guía Visual */}
              <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-[75%] max-w-[280px] aspect-[3/4] border border-white/30 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white/70 rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white/70 rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white/70 rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white/70 rounded-br-3xl" />
                </div>
                
                <div className="absolute bottom-4 text-center text-white text-[11px] font-bold px-4 py-2.5 bg-slate-900/80 rounded-xl backdrop-blur-md shadow-lg max-w-[90%]">
                  Coloca a la persona de frente y deja espacio libre.
                </div>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Previsualización" className="w-full h-full object-contain bg-slate-100" />
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        {/* CONTROLES */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shrink-0">
          {!capturedImage && !processing && !processingError ? (
            <div className="flex flex-col gap-3">
              <button 
                onClick={capturePhoto} 
                className="w-full py-3.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white font-black text-lg"
              >
                <Camera size={22}/> TOMAR FOTO
              </button>
              <div className="flex gap-2">
                <button onClick={toggleCamera} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={16}/> Cambiar cámara
                </button>
                <button onClick={() => { stopCamera(); onCancel(); }} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : processingError ? (
            <div className="flex gap-2 w-full">
              <button 
                onClick={retryPhoto} 
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Tomar Otra Foto
              </button>
              <button 
                onClick={processWithoutBackgroundRemoval} 
                className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
              >
                Usar Foto Original
              </button>
            </div>
          ) : capturedImage && !processing ? (
            <div className="flex gap-3 w-full">
              <button 
                onClick={retryPhoto} 
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-colors"
              >
                <RefreshCw size={18}/> Repetir
              </button>
              <button 
                onClick={confirmPhoto} 
                className="flex-[2] flex flex-col items-center justify-center gap-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/30 transition-colors"
              >
                <CheckCircle2 size={18}/> USAR ESTA FOTO
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 font-medium text-sm">
              Por favor espera...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
