import { Link } from "wouter";
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LoveAIHub</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Professional AI platform providing access to 20+ state-of-the-art AI models for image generation, video creation, chat completion, and more.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6">AI Services</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/image-generation" className="hover:text-white transition-colors">
                  Image Generation
                </Link>
              </li>
              <li>
                <Link href="/video-generation" className="hover:text-white transition-colors">
                  Video Creation
                </Link>
              </li>
              <li>
                <Link href="/ai-chat" className="hover:text-white transition-colors">
                  AI Chat
                </Link>
              </li>
              <li>
                <Link href="/audio-speech" className="hover:text-white transition-colors">
                  Audio & Speech
                </Link>
              </li>
              <li>
                <Link href="/image-editing" className="hover:text-white transition-colors">
                  Image Editing
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-white transition-colors">
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-6">Resources</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/api-docs" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 LoveAIHub. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
