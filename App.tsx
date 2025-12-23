
import React, { useState, useEffect } from 'react';
import { ProductAnalysis, StoryboardResponse, Scenario, GeneratedVideo } from './types';
import { analyzeProduct, generateStoryboard, generateVideo } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import AnalysisEditor from './components/AnalysisEditor';
import StoryboardResult from './components/StoryboardResult';
import VideoConsole from './components/VideoConsole';

// Fix: Define the AIStudio interface and use it for the window.aistudio property with the readonly modifier to match the global declaration.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [scenario, setScenario] = useState<Scenario>(Scenario.Cinematic);
  const [storyboard, setStoryboard] = useState<StoryboardResponse | null>(null);
  
  const [videoCount, setVideoCount] = useState(1);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);

  const handleImagesChange = async (newImages: string[]) => {
    setImages(newImages);
    if (newImages.length > 0) {
      setIsAnalyzing(true);
      try {
        const result = await analyzeProduct(newImages);
        setAnalysis(result);
      } catch (error) {
        console.error("Analysis failed", error);
        alert("图片分析失败，请稍后重试。");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setAnalysis(null);
    }
  };

  const handleGenerate = async () => {
    if (!analysis) return;
    setIsGenerating(true);
    try {
      const result = await generateStoryboard(analysis, scenario);
      setStoryboard(result);
    } catch (error) {
      console.error("Storyboard generation failed", error);
      alert("分镜生成失败，请检查 API 配置。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartVideoGeneration = async () => {
    if (!storyboard) return;

    // Veo API Key Check
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // Proceeding assuming user selected a key as per instructions
    }

    setIsGeneratingVideo(true);
    
    // Synthesize Video Prompt from Storyboard
    const videoPrompt = `A 15-second cinematic high-quality commercial video for ${analysis?.name}. 
    Environment: ${analysis?.suggestedBackground}. 
    Sequence: ${storyboard.shots.map(s => s.descriptionEn).join(" Transitioning into ")}. 
    Strictly maintain the product structure, materials, and lighting consistency throughout all shots. 
    Transitions are smooth, seamless, and fluid. Photorealistic, 8K details.`;

    const newVideos: GeneratedVideo[] = [];
    for (let i = 0; i < videoCount; i++) {
      const id = Math.random().toString(36).substr(2, 9);
      newVideos.push({ id, url: '', status: 'pending', prompt: videoPrompt });
    }
    setVideos(prev => [...newVideos, ...prev]);

    // Process queue
    for (const v of newVideos) {
      try {
        const videoUrl = await generateVideo(v.prompt);
        setVideos(current => current.map(item => item.id === v.id ? { ...item, url: videoUrl, status: 'completed' } : item));
      } catch (err) {
        console.error("Video generation error", err);
        setVideos(current => current.map(item => item.id === v.id ? { ...item, status: 'failed' } : item));
      }
    }
    
    setIsGeneratingVideo(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            StoryBoard <span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-slate-500 text-lg">AI 驱动的一站式产品分镜与视频生成系统</p>
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
            <span className="text-slate-600 font-medium">正在深度分析视觉资产...</span>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">选择分镜风格场景</h2>
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
              onGenerate={handleGenerate}
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
              onGenerate={handleStartVideoGeneration}
              isGenerating={isGeneratingVideo}
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
