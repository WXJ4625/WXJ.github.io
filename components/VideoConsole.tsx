
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-800">4. 动态视频生成 (Veo 3.1)</h2>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-500">生成数量 (1-50):</label>
          <input 
            type="number" 
            min="1" 
            max="50" 
            value={videoCount}
            onChange={(e) => setVideoCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-blue-600"
          />
        </div>
      </div>

      <p className="text-sm text-slate-500">
        AI 将自动基于分镜逻辑生成 10-15 秒的动态视频。我们将确保每一帧的产品结构高度一致，镜头衔接如行云流水。
      </p>

      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <p className="text-xs text-purple-700 flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          注意：视频生成需要 2-5 分钟/个。请确保您的 API Key 已启用计费功能（ai.google.dev/gemini-api/docs/billing）。
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isGenerating ? "正在渲染视频队列..." : "开始一键生成流畅视频"}
      </button>

      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {videos.map((v, i) => (
            <div key={v.id} className="relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group">
              {v.status === 'pending' ? (
                <div className="aspect-video flex flex-col items-center justify-center bg-slate-100 space-y-3">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-400">视频 #{videos.length - i} 渲染中...</span>
                </div>
              ) : v.status === 'failed' ? (
                <div className="aspect-video flex items-center justify-center bg-red-50">
                  <span className="text-xs text-red-500 font-medium">渲染失败，请检查额度或重试</span>
                </div>
              ) : (
                <>
                  <video src={v.url} controls className="w-full aspect-video object-cover" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={v.url} 
                      download={`storyboard-video-${v.id}.mp4`}
                      className="bg-white/90 p-2 rounded-full shadow-md text-slate-800 hover:text-purple-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoConsole;
