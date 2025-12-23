
export interface ProductAnalysis {
  name: string;
  details: string[];
  usage: string;
  usageActions: string[];
  targetAudience: string;
  materialFeatures: string[];
  visualKeywords: string[];
  suggestedBackground: string;
}

export interface StoryboardShot {
  id: string;
  description: string;
  descriptionEn: string;
}

export interface StoryboardResponse {
  intro: string;
  introEn: string;
  shots: StoryboardShot[];
}

export enum Scenario {
  Cinematic = '电影质感',
  Commercial = '商业广告',
  SocialMedia = '社交媒体',
  TechModern = '科技极简',
  NatureOutdoor = '自然户外',
  Cyberpunk = '赛博朋克',
  Studio = '专业棚拍'
}

export interface GeneratedVideo {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'failed';
}
