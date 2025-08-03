import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Code, 
  Copy, 
  Play, 
  Book, 
  Image, 
  Video, 
  MessageSquare, 
  Mic, 
  Edit,
  Key,
  Globe,
  Zap,
  Shield
} from "lucide-react";

const codeExamples = {
  javascript: `import { A4FClient } from '@/lib/a4fClient';

const client = new A4FClient('your-api-key');

// Generate an image
const imageResult = await client.generateImage({
  model: 'provider-6/FLUX-1-pro',
  prompt: 'A beautiful sunset over mountains',
  size: '1024x1024',
  quality: 'hd'
});

// Chat completion
const chatResult = await client.chatCompletion({
  model: 'provider-6/gpt-4.1',
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ]
});`,

  python: `import requests

# Image Generation
response = requests.post(
    'https://api.a4f.co/v1/images/generations',
    headers={
        'Authorization': 'Bearer your-api-key',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'provider-6/FLUX-1-pro',
        'prompt': 'A beautiful sunset over mountains',
        'size': '1024x1024',
        'quality': 'hd'
    }
)

result = response.json()`,

  curl: `curl -X POST https://api.a4f.co/v1/images/generations \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "provider-6/FLUX-1-pro",
    "prompt": "A beautiful sunset over mountains",
    "size": "1024x1024",
    "quality": "hd"
  }'`
};

const apiEndpoints = [
  {
    method: "POST",
    endpoint: "/v1/images/generations",
    description: "Generate images from text prompts",
    category: "Image Generation",
    icon: Image,
    models: ["FLUX-1-Pro", "DALL-E 3", "Imagen 4", "Stable Diffusion"]
  },
  {
    method: "POST",
    endpoint: "/v1/video/generations",
    description: "Generate videos from text descriptions",
    category: "Video Generation",
    icon: Video,
    models: ["WAN-2.1"]
  },
  {
    method: "POST",
    endpoint: "/v1/chat/completions",
    description: "AI chat completions with advanced models",
    category: "Chat Completion",
    icon: MessageSquare,
    models: ["GPT-4.1", "Claude 4", "Gemini 2.5 Pro"]
  },
  {
    method: "POST",
    endpoint: "/v1/audio/speech",
    description: "Generate speech from text",
    category: "Audio Generation",
    icon: Mic,
    models: ["TTS-1-HD", "Sonic-2", "Gemini TTS"]
  },
  {
    method: "POST",
    endpoint: "/v1/audio/transcriptions",
    description: "Transcribe audio to text",
    category: "Audio Transcription",
    icon: Mic,
    models: ["Whisper V3", "GPT-4o Transcribe"]
  },
  {
    method: "POST",
    endpoint: "/v1/images/edits",
    description: "Edit images with AI",
    category: "Image Editing",
    icon: Edit,
    models: ["FLUX Kontext Pro", "FLUX Kontext Max"]
  }
];

const features = [
  {
    icon: Zap,
    title: "20+ AI Models",
    description: "Access the latest AI models from multiple providers through one unified API"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee"
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Fast response times worldwide with our global infrastructure"
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Comprehensive SDKs and detailed documentation for quick integration"
  }
];

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [apiKey, setApiKey] = useState("");
  const [testPrompt, setTestPrompt] = useState("A beautiful sunset over mountains");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">API Documentation</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive documentation for integrating LoveAIHub's powerful AI APIs into your applications
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect border-border card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 rounded-lg mb-4 flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - API Endpoints */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Book className="w-5 h-5" />
                    <span>API Endpoints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedEndpoint(endpoint)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedEndpoint.endpoint === endpoint.endpoint
                            ? "bg-primary/20 border border-primary/50"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <endpoint.icon className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {endpoint.category}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {endpoint.method} {endpoint.endpoint}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <selectedEndpoint.icon className="w-6 h-6" />
                      <span>{selectedEndpoint.category}</span>
                    </CardTitle>
                    <Badge variant="outline" className="font-mono">
                      {selectedEndpoint.method}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedEndpoint.description}</p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="examples">Examples</TabsTrigger>
                      <TabsTrigger value="models">Models</TabsTrigger>
                      <TabsTrigger value="playground">Playground</TabsTrigger>
                    </TabsList>

                    {/* Overview */}
                    <TabsContent value="overview" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Endpoint Information</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="font-mono text-sm">
                              <span className="text-green-400">{selectedEndpoint.method}</span>{" "}
                              <span className="text-blue-400">https://api.a4f.co{selectedEndpoint.endpoint}</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Authentication</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              All API requests require authentication using your API key in the Authorization header:
                            </p>
                            <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-sm">
                              Authorization: Bearer your-api-key
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Rate Limits</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Free tier: 50 requests per month</div>
                              <div>• Premium tier: Unlimited requests</div>
                              <div>• Rate limit: 60 requests per minute</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Examples */}
                    <TabsContent value="examples" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                        
                        <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                          </TabsList>

                          {Object.entries(codeExamples).map(([lang, code]) => (
                            <TabsContent key={lang} value={lang}>
                              <div className="relative">
                                <pre className="p-4 bg-slate-800/50 rounded-lg overflow-x-auto text-sm">
                                  <code>{code}</code>
                                </pre>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(code)}
                                  className="absolute top-2 right-2"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    </TabsContent>

                    {/* Models */}
                    <TabsContent value="models" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Available Models</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEndpoint.models.map((model, index) => (
                            <div key={index} className="p-4 glass-effect rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{model}</h4>
                                <Badge variant="secondary" className="text-xs">Available</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                High-quality AI model with advanced capabilities for professional use cases.
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Playground */}
                    <TabsContent value="playground" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">API Playground</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                              id="apiKey"
                              type="password"
                              placeholder="Enter your API key"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="prompt">Test Prompt</Label>
                            <Textarea
                              id="prompt"
                              placeholder="Enter a test prompt"
                              value={testPrompt}
                              onChange={(e) => setTestPrompt(e.target.value)}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>

                          <Button
                            disabled={!apiKey || !testPrompt}
                            className="btn-primary"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Test API Call
                          </Button>

                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <Key className="w-5 h-5 text-blue-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-400">Get Your API Key</p>
                                <p className="text-xs text-blue-300">
                                  Sign up for a free account to get your API key and start building with our AI models.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SDKs Section */}
          <div className="mt-12">
            <Card className="glass-effect border-border">
              <CardHeader>
                <CardTitle>Official SDKs</CardTitle>
                <p className="text-muted-foreground">
                  Get started quickly with our official software development kits
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 glass-effect rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-yellow-400" />
                      </div>
                      <h3 className="font-semibold">JavaScript/TypeScript</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Official SDK for Node.js and browser environments
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 bg-slate-800/50 rounded font-mono text-sm">
                        npm install @loveaihub/sdk
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Documentation
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 glass-effect rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="font-semibold">Python</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Full-featured Python SDK with async support
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 bg-slate-800/50 rounded font-mono text-sm">
                        pip install loveaihub
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Documentation
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 glass-effect rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-green-400" />
                      </div>
                      <h3 className="font-semibold">Go</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lightweight Go SDK for high-performance applications
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 bg-slate-800/50 rounded font-mono text-sm">
                        go get github.com/loveaihub/go-sdk
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Documentation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
