import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Eye,
  BookOpen,
  TrendingUp,
  Sparkles,
  Brain,
  Zap
} from "lucide-react";

const categories = [
  { id: "all", name: "All Posts", count: 12 },
  { id: "ai-tutorial", name: "AI Tutorials", count: 5 },
  { id: "platform-update", name: "Platform Updates", count: 3 },
  { id: "ai-insights", name: "AI Insights", count: 4 },
];

const featuredPosts = [
  {
    id: "1",
    title: "Getting Started with FLUX Image Generation",
    excerpt: "Learn how to create stunning images using the latest FLUX models. From basic prompts to advanced techniques for professional results.",
    category: "AI Tutorial",
    author: "Alex Chen",
    publishedAt: "2024-01-15",
    readTime: "5 min read",
    viewCount: 1250,
    featured: true,
    tags: ["FLUX", "Image Generation", "Tutorial"],
    slug: "getting-started-flux-image-generation"
  },
  {
    id: "2",
    title: "New Video Generation Model: WAN-2.1 Released",
    excerpt: "Experience faster video generation with improved quality and new creative controls in our latest model update.",
    category: "Platform Update",
    author: "Sarah Johnson",
    publishedAt: "2024-01-12",
    readTime: "3 min read",
    viewCount: 890,
    featured: true,
    tags: ["WAN-2.1", "Video Generation", "Update"],
    slug: "wan-21-video-model-release"
  },
  {
    id: "3",
    title: "The Future of AI Chat: Advanced Tools Integration",
    excerpt: "Explore how our advanced AI chat combines multiple models with web search and analysis tools for better results.",
    category: "AI Insights",
    author: "David Rodriguez",
    publishedAt: "2024-01-10",
    readTime: "7 min read",
    viewCount: 2100,
    featured: true,
    tags: ["AI Chat", "Tools", "Future"],
    slug: "future-ai-chat-tools-integration"
  }
];

const recentPosts = [
  {
    id: "4",
    title: "Optimizing Image Prompts for Better Results",
    excerpt: "Tips and techniques for writing effective prompts that generate exactly what you envision.",
    category: "AI Tutorial",
    author: "Lisa Wang",
    publishedAt: "2024-01-08",
    readTime: "4 min read",
    viewCount: 756,
    featured: false,
    tags: ["Prompts", "Tips", "Optimization"],
    slug: "optimizing-image-prompts"
  },
  {
    id: "5",
    title: "API Rate Limits and Best Practices",
    excerpt: "Understanding rate limits and implementing best practices for efficient API usage.",
    category: "Platform Update",
    author: "Mike Thompson",
    publishedAt: "2024-01-05",
    readTime: "6 min read",
    viewCount: 445,
    featured: false,
    tags: ["API", "Rate Limits", "Best Practices"],
    slug: "api-rate-limits-best-practices"
  },
  {
    id: "6",
    title: "Understanding AI Model Capabilities",
    excerpt: "A comprehensive guide to choosing the right AI model for your specific use case.",
    category: "AI Insights",
    author: "Emma Davis",
    publishedAt: "2024-01-03",
    readTime: "8 min read",
    viewCount: 1340,
    featured: false,
    tags: ["AI Models", "Capabilities", "Guide"],
    slug: "understanding-ai-model-capabilities"
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredPosts, setFilteredPosts] = useState([...featuredPosts, ...recentPosts]);

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
    retry: false,
  });

  useEffect(() => {
    let posts = [...featuredPosts, ...recentPosts];
    
    if (selectedCategory !== "all") {
      posts = posts.filter(post => 
        post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }
    
    if (searchQuery) {
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredPosts(posts);
  }, [searchQuery, selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai tutorial':
        return BookOpen;
      case 'platform update':
        return TrendingUp;
      case 'ai insights':
        return Brain;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">AI Blog & Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay updated with AI trends, tutorials, platform updates, and insights from our team
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "btn-primary" : "btn-secondary"}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Posts */}
          {selectedCategory === "all" && searchQuery === "" && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span>Featured Articles</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => {
                  const CategoryIcon = getCategoryIcon(post.category);
                  
                  return (
                    <Card key={post.id} className={`glass-effect border-border card-hover overflow-hidden ${
                      index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                    }`}>
                      <div className={`h-48 bg-gradient-to-br ${
                        index === 0 ? "from-primary/20 to-purple-500/20" :
                        index === 1 ? "from-cyan-500/20 to-emerald-500/20" :
                        "from-purple-500/20 to-pink-500/20"
                      } flex items-center justify-center`}>
                        <CategoryIcon className="w-16 h-16 text-primary" />
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Featured
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-slate-800/50 rounded text-xs text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <Separator className="mb-4" />
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.readTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.viewCount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${post.slug}`}>
                          <Button className="w-full mt-4 btn-primary">
                            Read Article
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Posts */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory === "all" ? "All Articles" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            
            {filteredPosts.length === 0 ? (
              <Card className="glass-effect border-border">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search query or filter criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => {
                  const CategoryIcon = getCategoryIcon(post.category);
                  
                  return (
                    <Card key={post.id} className="glass-effect border-border card-hover overflow-hidden">
                      <div className={`h-40 bg-gradient-to-br ${
                        post.category === "AI Tutorial" ? "from-primary/20 to-purple-500/20" :
                        post.category === "Platform Update" ? "from-cyan-500/20 to-emerald-500/20" :
                        "from-purple-500/20 to-pink-500/20"
                      } flex items-center justify-center`}>
                        <CategoryIcon className="w-12 h-12 text-primary" />
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          {post.featured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-slate-800/50 rounded text-xs text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <Separator className="mb-4" />
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.viewCount.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${post.slug}`}>
                          <Button className="w-full btn-primary" size="sm">
                            Read Article
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16">
            <Card className="glass-effect border-border">
              <CardContent className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to our newsletter for the latest AI insights, tutorials, and platform updates.
                  </p>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter your email"
                      className="bg-slate-800/50 border-slate-700"
                    />
                    <Button className="btn-primary">
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    No spam, unsubscribe at any time.
                  </p>
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
