
import React from 'react';
import { GeneratedVideo } from '../types';

interface VideoConsoleProps {
  videoCount: number;
  setVideoCount: (count: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  videos: GeneratedVideo[];
}

const VideoConsole: React.FC<VideoConsoleProps> = ({ videoCount, setVideoCount, onGenerate, isGenerating, videos }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-800">4. 动态视频生成 (Veo 3.1)</h2>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-500">数量:</label>
          <input 
            type="number" 
            min="1" 
            max="50" 
            value={videoCount}
            onChange={(e) => setVideoCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-purple-600"
          />
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
        <div className="text-purple-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-xs text-purple-700 leading-relaxed">
          视频生成属于高级功能。点击生成后，系统将引导您选择一个**付费计费项目**的 API Key。每个视频渲染约需 2-5 分钟，生成的视频将保持产品结构的一致性。
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>渲染队列处理中...</span>
          </div>
        ) : "开始生成流畅 16:9 视频"}
      </button>

      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {videos.map((v) => (
            <div key={v.id} className="relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group">
              {v.status === 'pending' ? (
                <div className="aspect-video flex flex-col items-center justify-center bg-slate-100/50 space-y-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-purple-200 rounded-full"></div>
                    <div className="absolute inset-0 w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rendering...</span>
                </div>
              ) : v.status === 'failed' ? (
                <div className="aspect-video flex items-center justify-center bg-red-50 text-red-500 p-4 text-center">
                  <span className="text-xs font-medium">生成失败，请检查计费状态或稍后重试</span>
                </div>
              ) : (
                <div className="relative group">
                  <video src={v.url} controls className="w-full aspect-video object-cover" />
                  <a 
                    href={v.url} 
                    download={`storyboard-${v.id}.mp4`}
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoConsole;
