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
  file: File;
  language?: string;
  response_format?: string;
}

interface A4FEditRequest {
  model: string;
  image: File;
  mask?: File;
  prompt: string;
}

export class A4FClient {
  private apiKey: string;
  private baseUrl: string = "https://api.a4f.co/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.A4F_API_KEY || "ddc-a4f-cd950b4d41874c21acc4792bb0a392d7";
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

  private async makeFormRequest(endpoint: string, formData: FormData) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

  async enhancePrompt(prompt: string): Promise<string> {
    try {
      const response = await this.chatCompletion({
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

  async generateImage(request: A4FImageRequest) {
    return await this.makeRequest("/images/generations", request);
  }

  async generateVideo(request: A4FVideoRequest) {
    return await this.makeRequest("/video/generations", request);
  }

  async chatCompletion(request: A4FChatRequest) {
    return await this.makeRequest("/chat/completions", request);
  }

  async generateAudio(request: A4FAudioRequest) {
    return await this.makeRequest("/audio/speech", request);
  }

  async transcribeAudio(request: A4FTranscriptionRequest) {
    const formData = new FormData();
    formData.append("model", request.model);
    formData.append("file", request.file);
    if (request.language) formData.append("language", request.language);
    if (request.response_format) formData.append("response_format", request.response_format);

    return await this.makeFormRequest("/audio/transcriptions", formData);
  }

  async editImage(request: A4FEditRequest) {
    const formData = new FormData();
    formData.append("model", request.model);
    formData.append("image", request.image);
    if (request.mask) formData.append("mask", request.mask);
    formData.append("prompt", request.prompt);

    return await this.makeFormRequest("/images/edits", formData);
  }

  async generateEmbeddings(input: string[], model: string) {
    return await this.makeRequest("/embeddings", {
      model,
      input,
    });
  }

  async getModels() {
    return await this.makeRequest("/models", {}, "GET");
  }

  // Utility methods for common model configurations
  static getImageModels() {
    return [
      { id: "provider-6/gpt-image-1", name: "GPT Image 1", provider: "Provider 6" },
      { id: "provider-2/dall-e-3", name: "DALL-E 3", provider: "Provider 2" },
      { id: "provider-3/dall-e-3", name: "DALL-E 3", provider: "Provider 3" },
      { id: "provider-4/imagen-3", name: "Imagen 3", provider: "Provider 4" },
      { id: "provider-4/imagen-4", name: "Imagen 4", provider: "Provider 4" },
      { id: "provider-6/FLUX-1-pro", name: "FLUX-1 Pro", provider: "Provider 6" },
      { id: "provider-1/FLUX.1.1-pro", name: "FLUX 1.1 Pro", provider: "Provider 1" },
      { id: "provider-2/FLUX.1.1-pro", name: "FLUX 1.1 Pro", provider: "Provider 2" },
    ];
  }

  static getChatModels() {
    return [
      { id: "provider-6/gpt-4.1", name: "GPT-4.1", provider: "Provider 6" },
      { id: "provider-2/gpt-4.1", name: "GPT-4.1", provider: "Provider 2" },
      { id: "provider-3/gpt-4.1", name: "GPT-4.1", provider: "Provider 3" },
      { id: "provider-6/claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "Provider 6" },
      { id: "provider-3/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Provider 3" },
      { id: "provider-6/gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro", provider: "Provider 6" },
    ];
  }

  static getVideoModels() {
    return [
      { id: "provider-6/wan-2.1", name: "WAN-2.1", provider: "Provider 6", description: "High-quality video generation" },
    ];
  }

  static getAudioModels() {
    return [
      { id: "provider-2/tts-1", name: "TTS-1", provider: "Provider 2" },
      { id: "provider-2/tts-1-hd", name: "TTS-1 HD", provider: "Provider 2" },
      { id: "provider-6/sonic-2", name: "Sonic-2", provider: "Provider 6" },
      { id: "provider-6/sonic", name: "Sonic", provider: "Provider 6" },
    ];
  }

  static getTranscriptionModels() {
    return [
      { id: "provider-2/whisper-1", name: "Whisper-1", provider: "Provider 2" },
      { id: "provider-6/whisper-large-v3", name: "Whisper Large V3", provider: "Provider 6" },
      { id: "provider-6/whisper-large-v3-turbo", name: "Whisper Large V3 Turbo", provider: "Provider 6" },
    ];
  }

  static getEditingModels() {
    return [
      { id: "provider-3/flux-kontext-pro", name: "FLUX Kontext Pro", provider: "Provider 3" },
      { id: "provider-6/black-forest-labs-flux-1-kontext-pro", name: "FLUX Kontext Pro", provider: "Provider 6" },
      { id: "provider-6/black-forest-labs-flux-1-kontext-max", name: "FLUX Kontext Max", provider: "Provider 6" },
    ];
  }
}

export const a4fClient = new A4FClient();
