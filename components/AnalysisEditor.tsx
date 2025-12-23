
import React from 'react';
import { ProductAnalysis } from '../types';

interface AnalysisEditorProps {
  analysis: ProductAnalysis;
  onAnalysisChange: (analysis: ProductAnalysis) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const AnalysisEditor: React.FC<AnalysisEditorProps> = ({ analysis, onAnalysisChange, onGenerate, isGenerating }) => {
  const handleChange = (field: keyof ProductAnalysis, value: any) => {
    onAnalysisChange({ ...analysis, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
        <h2 className="text-lg font-bold text-slate-800">2. 视觉特征提取与精炼</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">产品名称</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={analysis.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">视觉关键词 (风格控制)</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 text-sm"
              placeholder="例如: 哑光黑, 碳纤维纹理, 冷色调..."
              value={analysis.visualKeywords.join(', ')}
              onChange={(e) => handleChange('visualKeywords', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">使用场景/具体动作</label>
            <textarea
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
              placeholder="例如: 双手持握, 放在发光的底座上, 正在被倒入液体..."
              value={analysis.usageActions.join(', ')}
              onChange={(e) => handleChange('usageActions', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
        </div>

        {/* Reverse Prompting Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">反推场景提示词 (Environment Prompt)</label>
            <textarea
              className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-52 text-sm italic font-serif"
              placeholder="输入场景英文描述..."
              value={analysis.suggestedBackground}
              onChange={(e) => handleChange('suggestedBackground', e.target.value)}
            />
            <p className="text-[10px] text-slate-400 mt-1">※ AI 根据产品质感自动推测的背景设定，您可以手动修改。 </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">材质与工艺</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              value={analysis.materialFeatures.join(', ')}
              onChange={(e) => handleChange('materialFeatures', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">应用场景 (概括)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              value={analysis.usage}
              onChange={(e) => handleChange('usage', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">受众定位</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              value={analysis.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full mt-4 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
      >
        {isGenerating ? "正在构建 3x3 分镜系统..." : "生成 3x3 专业分镜提示词"}
      </button>
    </div>
  );
};

export default AnalysisEditor;
