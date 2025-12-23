
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ProductAnalysis, StoryboardResponse, Scenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeProduct(images: string[]): Promise<ProductAnalysis> {
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
    3. 根据产品调性，反推一个能最大化展现产品美感的建议背景提示词（英文描述）。
    4. 提取 5 个核心视觉关键词。
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
          targetAudience: { type: Type.STRING },
          materialFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedBackground: { type: Type.STRING, description: "建议的背景/环境提示词（英文）" }
        },
        required: ["name", "details", "usage", "targetAudience", "materialFeatures", "visualKeywords", "suggestedBackground"]
      }
    }
  });

  return JSON.parse(response.text) as ProductAnalysis;
}

export async function generateStoryboard(
  analysis: ProductAnalysis, 
  scenario: Scenario
): Promise<StoryboardResponse> {
  const prompt = `
    基于以下产品数据生成分镜。
    产品: ${analysis.name}
    视觉关键词: ${analysis.visualKeywords.join(", ")}
    材质特征: ${analysis.materialFeatures.join(", ")}
    选定背景: ${analysis.suggestedBackground}
    分镜风格: ${scenario}

    请生成 9 个连续的电影化分镜提示词。
    严格遵守以下格式生成开场白（intro）：
    根据[${analysis.visualKeywords.join(", ")}, ${analysis.materialFeatures.join(", ")}], 生成一张具有凝聚力的[3x3]网格图像，包含在同一环境中的[9]个不同摄像镜头，镜头的第一个和最后一个主体完全一致严格保持人物/物体、服装和光线的一致性，[8K]分辨率，[16:9]画幅。背景设定为：${analysis.suggestedBackground}。

    英文版开场白（introEn）：
    Based on [${analysis.visualKeywords.join(", ")}, ${analysis.materialFeatures.join(", ")}], generate a cohesive [3x3] grid image containing [9] different camera shots in the same environment. The first and last shots have identical subjects, maintaining strict consistency in person/object, clothing, and lighting, [8K] resolution, [16:9] aspect ratio. Environment: ${analysis.suggestedBackground}.

    要求：
    1. 9个分镜必须构成一个完整叙事或多角度展示。
    2. 确保首尾一致性。
    3. 提供中英文对照。
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
