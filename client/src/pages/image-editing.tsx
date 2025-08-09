import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImageEditing() {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Image Editing Suite</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional AI-powered image editing with inpainting, outpainting, and style transfer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-effect border-border">
              <CardHeader>
                <CardTitle>Image Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Image editing tools will be here.</p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Edit Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}