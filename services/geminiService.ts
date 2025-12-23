
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ProductAnalysis, StoryboardResponse, Scenario } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeProduct(images: string[]): Promise<ProductAnalysis> {
  const ai = getAIClient();
  const parts = images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1]
    }
  }));

  const prompt = `
    作为一名资深视觉分析师，深度分析这些产品图片。
    1. 提取核心视觉细节（如：材质纹理、独特设计元素、色彩比例）。
    2. 分析产品用途和适用环境。
    3. 提取 3-5 个具体的使用场景或动作描述。
    4. 根据产品调性，反推一个背景提示词（英文描述）。
    5. 提取 5 个核心视觉关键词。
    请务必使用中文返回文本内容（除英文提示词外）。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [...parts, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          details: { type: Type.ARRAY, items: { type: Type.STRING } },
          usage: { type: Type.STRING },
          usageActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING },
          materialFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedBackground: { type: Type.STRING }
        },
        required: ["name", "details", "usage", "usageActions", "targetAudience", "materialFeatures", "visualKeywords", "suggestedBackground"]
      }
    }
  });

  return JSON.parse(response.text) as ProductAnalysis;
}

export async function generateStoryboard(
  analysis: ProductAnalysis, 
  scenario: Scenario
): Promise<StoryboardResponse> {
  const ai = getAIClient();
  const prompt = `
    基于以下产品数据生成分镜。
    产品: ${analysis.name}
    视觉关键词: ${analysis.visualKeywords.join(", ")}
    材质特征: ${analysis.materialFeatures.join(", ")}
    使用场景/动作: ${analysis.usageActions.join(", ")}
    选定背景: ${analysis.suggestedBackground}
    分镜风格: ${scenario}

    请生成 9 个连续的电影化分镜提示词。
    严格遵守输出要求，确保分镜衔接紧密，首尾一致。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intro: { type: Type.STRING },
          introEn: { type: Type.STRING },
          shots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING },
                descriptionEn: { type: Type.STRING }
              }
            }
          }
        },
        required: ["intro", "introEn", "shots"]
      }
    }
  });

  return JSON.parse(response.text) as StoryboardResponse;
}

export async function generateVideo(prompt: string): Promise<string> {
  // CRITICAL: New instance right before the call for up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    // Polling also needs fresh client as per guidelines
    const aiPoll = new GoogleGenAI({ apiKey: process.env.API_KEY });
    operation = await aiPoll.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  return `${downloadLink}&key=${process.env.API_KEY}`;
}
