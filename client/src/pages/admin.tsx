import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";
import Footer from "@/components/footer";
import { 
  Shield, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Crown,
  Activity,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X
} from "lucide-react";

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [newPostPublished, setNewPostPublished] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, user, toast]);

  // Fetch admin data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: blogPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/blog"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Create blog post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest("POST", "/api/admin/blog", postData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Blog post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      resetForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create post.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostExcerpt("");
    setNewPostCategory("");
    setNewPostTags("");
    setNewPostPublished(false);
    setEditingPost(null);
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    const slug = newPostTitle.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    createPostMutation.mutate({
      title: newPostTitle,
      slug,
      content: newPostContent,
      excerpt: newPostExcerpt,
      category: newPostCategory,
      tags: newPostTags.split(',').map(tag => tag.trim()).filter(Boolean),
      published: newPostPublished,
    });
  };

  if (authLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <BackButton />

      <div className="pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center space-x-3">
              <Shield className="w-10 h-10 text-primary" />
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage users, content, analytics, and platform settings
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalUsers || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalGenerations || 0}</div>
                    <div className="text-sm text-muted-foreground">Generations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.activeSubscriptions || 0}</div>
                    <div className="text-sm text-muted-foreground">Premium Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$2,450</div>
                    <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Blog</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Users Management */}
            <TabsContent value="users">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-6 h-6" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Generations</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users?.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    {user.isAdmin && (
                                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.subscriptionType === "premium" ? "default" : "outline"}>
                                  {user.subscriptionType === "premium" ? "Premium" : "Free"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.generationsUsed} / {user.generationsLimit}
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-effect border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-6 h-6" />
                      <span>Usage Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Image Generations</span>
                          <span className="font-semibold">65%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Chat Completions</span>
                          <span className="font-semibold">25%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Video Generations</span>
                          <span className="font-semibold">10%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-6 h-6" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">New user registration</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Premium subscription activated</p>
                          <p className="text-xs text-muted-foreground">15 minutes ago</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">High API usage detected</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Blog Management */}
            <TabsContent value="blog">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create New Post */}
                <Card className="glass-effect border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-6 h-6" />
                      <span>{editingPost ? "Edit Post" : "Create New Post"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="Enter post title"
                        className="bg-slate-800/50 border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={newPostExcerpt}
                        onChange={(e) => setNewPostExcerpt(e.target.value)}
                        placeholder="Brief description of the post"
                        className="bg-slate-800/50 border-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value)}
                          placeholder="AI Tutorial"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={newPostTags}
                          onChange={(e) => setNewPostTags(e.target.value)}
                          placeholder="AI, Tutorial, Tips"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Write your post content here..."
                        className="min-h-[200px] bg-slate-800/50 border-slate-700"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={newPostPublished}
                        onCheckedChange={setNewPostPublished}
                      />
                      <Label htmlFor="published">Publish immediately</Label>
                    </div>

                    <Separator />

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="btn-primary flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingPost ? "Update Post" : "Create Post"}
                      </Button>
                      {editingPost && (
                        <Button
                          onClick={resetForm}
                          variant="outline"
                          className="btn-secondary"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Posts */}
                <Card className="glass-effect border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-6 h-6" />
                      <span>Existing Posts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {postsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="loading-shimmer h-20 rounded-lg"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {blogPosts?.map((post: any) => (
                          <div key={post.id} className="p-4 glass-effect rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-2">{post.title}</h4>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{post.viewCount || 0}</span>
                                  </div>
                                  <Badge variant={post.published ? "secondary" : "outline"} className="text-xs">
                                    {post.published ? "Published" : "Draft"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingPost(post)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-6 h-6" />
                    <span>Platform Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Rate Limiting</h4>
                          <p className="text-sm text-muted-foreground">Control API request limits</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Auto Scaling</h4>
                          <p className="text-sm text-muted-foreground">Automatically scale resources</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Management</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">User Registration</h4>
                          <p className="text-sm text-muted-foreground">Allow new user sign-ups</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Email Verification</h4>
                          <p className="text-sm text-muted-foreground">Require email verification</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Platform Maintenance</h3>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full">
                        Clear System Cache
                      </Button>
                      <Button variant="outline" className="w-full">
                        Export User Data
                      </Button>
                      <Button variant="destructive" className="w-full">
                        Maintenance Mode
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
