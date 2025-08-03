import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Copy
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["/api/blog/posts", slug],
    enabled: !!slug,
    retry: false,
  });

  // Fallback post data for demonstration
  const fallbackPost = {
    id: "1",
    title: "Getting Started with FLUX Image Generation",
    content: `
# Introduction

Welcome to the comprehensive guide on FLUX image generation! In this tutorial, we'll explore how to create stunning images using the latest FLUX models available on our platform.

## What is FLUX?

FLUX is a cutting-edge image generation model that combines speed with quality. It offers several variants:

- **FLUX-1-Schnell**: Fast generation with good quality
- **FLUX-1-Pro**: Professional quality with advanced controls
- **FLUX-1-Dev**: Development version with experimental features

## Getting Started

### Step 1: Choose Your Model

The first step is selecting the right FLUX model for your needs:

\`\`\`javascript
const models = {
  fast: "provider-1/FLUX-1-schnell",
  professional: "provider-6/FLUX-1-pro", 
  experimental: "provider-6/FLUX-1-dev"
};
\`\`\`

### Step 2: Craft Your Prompt

A good prompt is essential for great results. Here are some tips:

1. **Be specific**: Instead of "a dog", try "a golden retriever sitting in a sunny park"
2. **Include style details**: "in the style of impressionist painting"
3. **Specify composition**: "wide shot", "close-up portrait", "bird's eye view"

### Step 3: Advanced Parameters

FLUX models support various parameters to fine-tune your generation:

- **Size**: Choose from standard resolutions like 1024x1024, 1920x1080
- **Quality**: Standard or HD quality options
- **Style**: Different artistic styles and approaches

## Best Practices

### Prompt Engineering Tips

Here are some advanced techniques for better results:

1. **Use descriptive adjectives**: "vibrant colors", "soft lighting", "dramatic shadows"
2. **Reference art styles**: "photorealistic", "oil painting style", "digital art"
3. **Include technical details**: "sharp focus", "highly detailed", "4K resolution"

### Common Mistakes to Avoid

- Don't make prompts too long or complex
- Avoid contradictory instructions
- Don't rely solely on negative prompts

## Advanced Techniques

### Prompt Enhancement

Our platform offers AI-powered prompt enhancement that can improve your results automatically. Simply enable the "enhance" option when generating images.

### Model Comparison

Different FLUX models excel at different tasks:

| Model | Best For | Speed | Quality |
|-------|----------|-------|---------|
| FLUX-1-Schnell | Quick iterations | Fast | Good |
| FLUX-1-Pro | Professional work | Medium | Excellent |
| FLUX-1-Dev | Experimentation | Medium | Variable |

## Conclusion

FLUX models represent the cutting edge of AI image generation. With the right prompts and settings, you can create professional-quality images for any project.

Ready to start creating? Head over to our Image Generation Studio and experiment with these techniques!

## Additional Resources

- [FLUX Model Documentation](https://docs.loveaihub.com/flux)
- [Prompt Engineering Guide](https://docs.loveaihub.com/prompts)
- [Community Gallery](https://loveaihub.com/gallery)

Happy generating!
    `,
    excerpt: "Learn how to create stunning images using the latest FLUX models. From basic prompts to advanced techniques for professional results.",
    category: "AI Tutorial",
    tags: ["FLUX", "Image Generation", "Tutorial", "AI"],
    author: "LoveAIHub Team",
    publishedAt: "2024-01-15T10:00:00Z",
    readTime: "5 min read"
  };

  const displayPost = post || fallbackPost;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform: string) => {
    const title = encodeURIComponent(displayPost.title);
    const url = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard",
        });
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI Tutorial": return "bg-primary/20 text-primary";
      case "Platform Update": return "bg-cyan-500/20 text-cyan-400";
      case "AI Insights": return "bg-purple-500/20 text-purple-400";
      case "Technical": return "bg-orange-500/20 text-orange-400";
      case "News": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-12 bg-muted rounded mb-4"></div>
              <div className="h-6 bg-muted rounded mb-8"></div>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !post) {
    const isUnauthorized = isUnauthorizedError(error as Error);
    
    if (isUnauthorized) {
      useEffect(() => {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view this article",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
      }, [toast]);
      
      return null;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button>
              <a href="/blog">Back to Blog</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6">
            <a href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </a>
          </Button>

          {/* Article Header */}
          <div className="mb-8">
            <Badge className={`mb-4 ${getCategoryColor(displayPost.category)}`}>
              {displayPost.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              {displayPost.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {displayPost.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {displayPost.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(displayPost.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {displayPost.readTime}
              </div>
            </div>

            {/* Tags */}
            {displayPost.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {displayPost.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Social Share & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Tweet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Post
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Article Content */}
          <Card className="glass-effect">
            <CardContent className="p-8">
              <div 
                className="prose prose-invert max-w-none prose-headings:gradient-text prose-headings:font-bold prose-p:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-table:text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: displayPost.content
                    .split('\n')
                    .map(line => {
                      // Handle headers
                      if (line.startsWith('# ')) {
                        return `<h1 class="gradient-text">${line.slice(2)}</h1>`;
                      }
                      if (line.startsWith('## ')) {
                        return `<h2 class="gradient-text">${line.slice(3)}</h2>`;
                      }
                      if (line.startsWith('### ')) {
                        return `<h3 class="gradient-text">${line.slice(4)}</h3>`;
                      }
                      
                      // Handle code blocks
                      if (line.startsWith('```')) {
                        const isClosing = line === '```';
                        const lang = isClosing ? '' : line.slice(3);
                        return isClosing ? '</pre></code>' : `<code><pre class="language-${lang}">`;
                      }
                      
                      // Handle inline code
                      line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
                      
                      // Handle bold
                      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      
                      // Handle bullet points
                      if (line.match(/^\d+\./)) {
                        return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
                      }
                      if (line.startsWith('- ')) {
                        return `<li>${line.slice(2)}</li>`;
                      }
                      
                      // Handle tables
                      if (line.includes('|')) {
                        const cells = line.split('|').filter(cell => cell.trim());
                        if (cells.length > 1) {
                          const isHeader = line.includes('---');
                          if (isHeader) return '';
                          const cellElements = cells.map(cell => 
                            line.includes('Model') || line.includes('Best For') ? 
                            `<th>${cell.trim()}</th>` : 
                            `<td>${cell.trim()}</td>`
                          ).join('');
                          return `<tr>${cellElements}</tr>`;
                        }
                      }
                      
                      // Regular paragraphs
                      if (line.trim()) {
                        return `<p>${line}</p>`;
                      }
                      
                      return line;
                    })
                    .join('')
                    .replace(/<li>/g, '<ul><li>')
                    .replace(/<\/li>(?!\s*<li>)/g, '</li></ul>')
                    .replace(/<tr>/g, '<table class="w-full border-collapse border border-border"><tr>')
                    .replace(/<\/tr>(?!\s*<tr>)/g, '</tr></table>')
                }}
              />
            </CardContent>
          </Card>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-semibold mb-2">Share this article</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')}>
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('copy')}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Written by</p>
                <p className="font-semibold">{displayPost.author}</p>
              </div>
            </div>
          </div>

          {/* Related Articles CTA */}
          <Card className="glass-effect mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Explore More AI Tutorials</h3>
              <p className="text-muted-foreground mb-6">
                Discover more guides and insights about AI technology and our platform
              </p>
              <Button className="btn-depth">
                <a href="/blog">View All Articles</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
