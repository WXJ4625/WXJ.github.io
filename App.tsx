
import React, { useState, useEffect } from 'react';
import { ProductAnalysis, StoryboardResponse, Scenario, GeneratedVideo } from './types';
import { analyzeProduct, generateStoryboard, generateVideo } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import AnalysisEditor from './components/AnalysisEditor';
import StoryboardResult from './components/StoryboardResult';
import VideoConsole from './components/VideoConsole';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Removed 'readonly' modifier to match other declarations of 'aistudio'
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [scenario, setScenario] = useState<Scenario>(Scenario.Cinematic);
  const [storyboard, setStoryboard] = useState<StoryboardResponse | null>(null);
  
  // Video States
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [videoCount, setVideoCount] = useState(1);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);

  const handleImagesChange = async (newImages: string[]) => {
    setImages(newImages);
    if (newImages.length > 0) {
      setIsAnalyzing(true);
      try {
        const result = await analyzeProduct(newImages);
        setAnalysis(result);
      } catch (error) {
        console.error("Analysis failed", error);
        alert("图片分析失败，请检查网络或图片格式。");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setAnalysis(null);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!analysis) return;
    setIsGenerating(true);
    try {
      const result = await generateStoryboard(analysis, scenario);
      setStoryboard(result);
    } catch (error) {
      console.error("Storyboard generation failed", error);
      alert("分镜生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideos = async () => {
    if (!storyboard || !analysis) return;

    // Check for API Key (Mandatory for Veo)
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        await window.aistudio.openSelectKey();
        // Assume success to avoid race condition
      }
    }

    setIsGeneratingVideos(true);
    
    // Add pending placeholders
    const newPending: GeneratedVideo[] = Array.from({ length: videoCount }).map(() => ({
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      url: ''
    }));
    setVideos(prev => [...newPending, ...prev]);

    // Process each video in the queue
    for (const v of newPending) {
      try {
        // Build a strong prompt for video consistency
        const randomShot = storyboard.shots[Math.floor(Math.random() * storyboard.shots.length)];
        const videoPrompt = `A 15-second cinematic product video for ${analysis.name}. 
          Scene description: ${randomShot.descriptionEn}. 
          Keywords: ${analysis.visualKeywords.join(", ")}. 
          Environment: ${analysis.suggestedBackground}. 
          Strictly maintain the product's structure and materials as shown in references. 
          Fluid camera movement, 8K resolution, high-end commercial quality.`;

        const videoUrl = await generateVideo(videoPrompt);
        setVideos(prev => prev.map(item => item.id === v.id ? { ...item, status: 'completed', url: videoUrl } : item));
      } catch (error: any) {
        console.error("Video generation error", error);
        
        // Handle specific "entity not found" error which usually means the key project isn't set up right
        if (error.message?.includes("Requested entity was not found")) {
          alert("检测到 API 项目配置异常。请确保您选择的是一个已开启计费功能的 Paid 项目。");
        }
        
        setVideos(prev => prev.map(item => item.id === v.id ? { ...item, status: 'failed' } : item));
      }
    }
    
    setIsGeneratingVideos(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            StoryBoard <span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-slate-500 text-lg">AI 驱动的产品视觉分析与分镜生产系统</p>
        </div>

        <ImageUploader 
          images={images} 
          onImagesChange={handleImagesChange} 
          isAnalyzing={isAnalyzing}
        />

        {isAnalyzing && (
          <div className="flex items-center justify-center p-12 space-x-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            <span className="text-slate-600 font-medium">深度视觉特征分析中...</span>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">选择分镜艺术风格</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(Scenario).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      scenario === s 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <AnalysisEditor 
              analysis={analysis} 
              onAnalysisChange={setAnalysis} 
              onGenerate={handleGenerateStoryboard}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {storyboard && (
          <>
            <StoryboardResult data={storyboard} />
            <VideoConsole 
              videoCount={videoCount}
              setVideoCount={setVideoCount}
              onGenerate={handleGenerateVideos}
              isGenerating={isGeneratingVideos}
              videos={videos}
            />
          </>
        )}

        <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2024 StoryBoard AI Visual Planner. 核心技术由 Gemini & Veo 驱动。</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
