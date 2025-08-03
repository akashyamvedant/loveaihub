export interface A4FImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
}

export interface A4FVideoGenerationRequest {
  model: string;
  prompt: string;
}

export interface A4FChatRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface A4FAudioRequest {
  model: string;
  input: string;
  voice?: string;
}

export interface A4FTranscriptionRequest {
  model: string;
  file: Buffer;
  language?: string;
}

export class A4FService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.A4F_API_KEY || process.env.A4F_API_KEY_ENV_VAR || "ddc-a4f-cd950b4d41874c21acc4792bb0a392d7";
    this.baseUrl = "https://api.a4f.co/v1";
  }

  private async makeRequest(endpoint: string, data: any, method = 'POST') {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`A4F API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateImage(request: A4FImageGenerationRequest) {
    return this.makeRequest('/images/generations', request);
  }

  async generateVideo(request: A4FVideoGenerationRequest) {
    return this.makeRequest('/video/generations', request);
  }

  async chatCompletion(request: A4FChatRequest) {
    return this.makeRequest('/chat/completions', request);
  }

  async generateAudio(request: A4FAudioRequest) {
    return this.makeRequest('/audio/speech', request);
  }

  async transcribeAudio(request: A4FTranscriptionRequest) {
    const formData = new FormData();
    formData.append('file', new Blob([request.file]));
    formData.append('model', request.model);
    if (request.language) {
      formData.append('language', request.language);
    }

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`A4F API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async editImage(request: any) {
    return this.makeRequest('/images/edits', request);
  }

  async getEmbeddings(request: any) {
    return this.makeRequest('/embeddings', request);
  }

  // Enhanced prompt for image generation
  async enhancePrompt(prompt: string) {
    const enhanceRequest: A4FChatRequest = {
      model: "provider-3/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at enhancing image generation prompts. Take the user's basic prompt and enhance it with artistic details, lighting, composition, and style elements while keeping the core concept intact. Return only the enhanced prompt."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    };

    const response = await this.chatCompletion(enhanceRequest);
    return response.choices[0].message.content;
  }
}

export const a4fService = new A4FService();
