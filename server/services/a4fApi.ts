import { Generation } from "@shared/schema";

interface A4FImageRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  response_format?: string;
}

interface A4FVideoRequest {
  model: string;
  prompt: string;
  duration?: number;
  aspect_ratio?: string;
}

interface A4FChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface A4FAudioRequest {
  model: string;
  input: string;
  voice?: string;
  response_format?: string;
  speed?: number;
}

interface A4FTranscriptionRequest {
  model: string;
  file: Buffer;
  language?: string;
  response_format?: string;
}

export class A4FApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.A4F_API_KEY || process.env.A4F_API_KEY_ENV_VAR || "ddc-a4f-cd950b4d41874c21acc4792bb0a392d7";
    this.baseUrl = "https://api.a4f.co/v1";
  }

  private async makeRequest(endpoint: string, data: any, method: string = "POST") {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`A4F API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async enhancePrompt(prompt: string): Promise<string> {
    try {
      const response = await this.makeRequest("/chat/completions", {
        model: "provider-3/gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional AI prompt engineer. Enhance the given prompt to be more detailed, specific, and optimized for image generation. Keep the core idea but add artistic details, style specifications, and technical parameters that will result in better AI-generated images."
          },
          {
            role: "user",
            content: `Enhance this prompt for image generation: "${prompt}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      return prompt; // Return original prompt if enhancement fails
    }
  }

  async generateImage(request: A4FImageRequest): Promise<any> {
    return await this.makeRequest("/images/generations", request);
  }

  async generateVideo(request: A4FVideoRequest): Promise<any> {
    return await this.makeRequest("/video/generations", request);
  }

  async chatCompletion(request: A4FChatRequest): Promise<any> {
    return await this.makeRequest("/chat/completions", request);
  }

  async generateAudio(request: A4FAudioRequest): Promise<any> {
    return await this.makeRequest("/audio/speech", request);
  }

  async transcribeAudio(request: A4FTranscriptionRequest): Promise<any> {
    const formData = new FormData();
    formData.append("model", request.model);
    formData.append("file", new Blob([request.file]));
    if (request.language) formData.append("language", request.language);
    if (request.response_format) formData.append("response_format", request.response_format);

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`A4F API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async editImage(imageFile: Buffer, maskFile: Buffer | null, prompt: string, model: string): Promise<any> {
    const formData = new FormData();
    formData.append("model", model);
    formData.append("image", new Blob([imageFile]));
    if (maskFile) formData.append("mask", new Blob([maskFile]));
    formData.append("prompt", prompt);

    const response = await fetch(`${this.baseUrl}/images/edits`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`A4F API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async generateEmbeddings(input: string[], model: string): Promise<any> {
    return await this.makeRequest("/embeddings", {
      model,
      input,
    });
  }

  // Get available models
  async getModels(): Promise<any> {
    return await this.makeRequest("/models", {}, "GET");
  }
}

export const a4fApi = new A4FApiService();
