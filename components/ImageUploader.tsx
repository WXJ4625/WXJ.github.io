
import React, { useRef } from 'react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  isAnalyzing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    // Fix: Explicitly cast Array.from result to File[] to ensure correct typing for reader.readAsDataURL
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          onImagesChange([...images, ...newImages]);
        }
      };
      // Fix for Error: Argument of type 'unknown' is not assignable to parameter of type 'Blob'.
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    onImagesChange(next);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">1. 参考图片上传</h2>
        <span className="text-xs text-slate-400">支持多图分析</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={img} className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          disabled={isAnalyzing}
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">添加图片</span>
        </button>
      </div>
      <input 
        type="file" 
        multiple 
        hidden 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
      />
    </div>
  );
};

export default ImageUploader;
