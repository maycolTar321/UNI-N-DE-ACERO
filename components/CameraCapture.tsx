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

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const targetRatio = 3 / 4;
        const videoRatio = canvas.width / canvas.height;
        
        let cropWidth = canvas.width;
        let cropHeight = canvas.height;
        let cropX = 0;
        let cropY = 0;

        if (videoRatio > targetRatio) {
          // El video es más "ancho" que 3:4 (ej: 16:9 landscape) -> recortamos los lados
          cropWidth = canvas.height * targetRatio;
          cropX = (canvas.width - cropWidth) / 2;
        } else {
          // El video es más "alto" que 3:4 (ej: 9:16 portrait) -> recortamos arriba y abajo
          cropHeight = canvas.width / targetRatio;
          cropY = (canvas.height - cropHeight) / 2;
        }
        
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        
        if (croppedCtx) {
          croppedCtx.drawImage(
            canvas, 
            cropX, cropY, cropWidth, cropHeight, 
            0, 0, cropWidth, cropHeight
          );
          const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.85); 
          setCapturedImage(dataUrl);
        }
      }
    }
  };

  const retryPhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onConfirm(capturedImage);
      stopCamera();
    }
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-in fade-in">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center shrink-0">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Camera size={16}/> {capturedImage ? "FOTO CAPTURADA" : "Fotografía para carnet"}
          </h3>
          <button onClick={() => { stopCamera(); onCancel(); }} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <div className="relative bg-black w-full aspect-[3/4] flex items-center justify-center overflow-hidden shrink-0">
          {!capturedImage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              ></video>
              
              {/* Guía Visual (Encuadre Tipo Carnet / Identidad) */}
              <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                {/* Silhouette Overlay */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 border-[6px] border-emerald-500/50" />
                  
                  {/* Recorte transparente para el rostro y hombros */}
                  <div className="relative w-[60%] h-[70%] border-2 border-emerald-400 border-dashed rounded-t-[100px] rounded-b-[40px] shadow-[0_0_0_999px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center overflow-hidden">
                    
                    {/* Guía de Cabeza */}
                    <div className="w-[60%] h-[45%] border border-emerald-400/50 rounded-full mt-4" />
                    
                    {/* Guía de Hombros */}
                    <div className="w-[120%] h-[30%] border border-emerald-400/50 rounded-t-[100%] mt-auto -mb-4" />
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 font-black text-[10px] uppercase tracking-widest text-center drop-shadow-md whitespace-nowrap">
                      Alinea tu rostro aquí
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-6 text-center text-white text-xs font-bold px-6 py-3 bg-slate-900/80 rounded-xl backdrop-blur-md shadow-2xl border border-white/10 max-w-[85%]">
                  <p className="text-emerald-400 mb-1 uppercase tracking-wider text-[10px]">Fotografía de Identificación</p>
                  Ubícate frente a un <b>fondo blanco o claro</b> uniforme.
                  <br/>Mira de frente y centra tu rostro.
                </div>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Previsualización" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        <div className="p-6 bg-slate-100 flex flex-col gap-4 shrink-0 overflow-y-auto">
          {!capturedImage ? (
            <div className="flex flex-col gap-3">
              <button 
                onClick={capturePhoto} 
                className="w-full py-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-white font-black text-lg"
              >
                <Camera size={24}/> TOMAR FOTO
              </button>
              <div className="flex gap-2">
                <button onClick={toggleCamera} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={16}/> Cambiar cámara
                </button>
                <button onClick={() => { stopCamera(); onCancel(); }} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 w-full">
              <button 
                onClick={retryPhoto} 
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-colors"
              >
                <RefreshCw size={18}/> REPETIR
              </button>
              <button 
                onClick={confirmPhoto} 
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-colors"
              >
                <CheckCircle2 size={18}/> CONFIRMAR FOTO
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
