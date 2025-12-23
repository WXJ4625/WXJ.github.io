
import React, { useState, useCallback } from 'react';
import { ProductAnalysis, StoryboardResponse, Scenario } from './types';
import { analyzeProduct, generateStoryboard } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import AnalysisEditor from './components/AnalysisEditor';
import StoryboardResult from './components/StoryboardResult';

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [scenario, setScenario] = useState<Scenario>(Scenario.Cinematic);
  const [storyboard, setStoryboard] = useState<StoryboardResponse | null>(null);

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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            StoryBoard <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-slate-500 text-lg">基于参考图的 3x3 视觉分镜专业生成器</p>
        </div>

        {/* Upload Section */}
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
            <span className="text-slate-600 font-medium">AI 正在深度分析产品细节...</span>
          </div>
        )}

        {/* Editor & Scenario Selection */}
        {analysis && !isAnalyzing && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">选择分镜风格场景</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

        {/* Results */}
        {storyboard && (
          <StoryboardResult data={storyboard} />
        )}

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2024 StoryBoard AI Visual Planner. 专注极致的一致性视觉产出。</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
