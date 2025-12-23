
import React, { useState } from 'react';
import { StoryboardResponse } from '../types';

interface StoryboardResultProps {
  data: StoryboardResponse;
}

const StoryboardResult: React.FC<StoryboardResultProps> = ({ data }) => {
  const [lang, setLang] = useState<'cn' | 'en'>('cn');

  const copyToClipboard = () => {
    let text = lang === 'cn' ? data.intro : data.introEn;
    text += "\n\n";
    data.shots.forEach((shot, idx) => {
      text += `${lang === 'cn' ? '镜头' : 'Shot'} ${idx + 1}: ${lang === 'cn' ? shot.description : shot.descriptionEn}\n`;
    });
    
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板！');
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl mt-8 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
          3. 最终分镜提示词 (3x3 Cohesive Grid)
        </h2>
        <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg border border-slate-700">
          <button
            onClick={() => setLang('cn')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${lang === 'cn' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            中文
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            English
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 mb-6 font-mono text-sm leading-relaxed text-slate-300">
        <p className="mb-4 text-blue-400 font-bold">
          {lang === 'cn' ? data.intro : data.introEn}
        </p>
        <div className="space-y-2">
          {data.shots.map((shot, idx) => (
            <div key={idx} className="group">
              <span className="text-indigo-400 font-bold mr-2">
                {lang === 'cn' ? '镜头' : 'Shot'} {String(idx + 1).padStart(2, '0')}:
              </span>
              <span>{lang === 'cn' ? shot.description : shot.descriptionEn}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={copyToClipboard}
        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium border border-slate-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        复制完整提示词
      </button>
    </div>
  );
};

export default StoryboardResult;
