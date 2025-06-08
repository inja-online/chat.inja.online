"use client";

import { Chrome, Eye, EyeOff, Github, Key } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function SignInPage() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiKeySignIn = async () => {
    if (!apiKey.trim() || !provider) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), provider }),
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const error = await response.json();
        alert(error.message || "Failed to authenticate with API key");
      }
    } catch (error) {
      console.error("API key authentication error:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-bold text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue chatting</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="oauth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth">OAuth</TabsTrigger>
              <TabsTrigger value="apikey">API Key</TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="mt-4 space-y-4">
              <Button
                onClick={() => signIn("github", { callbackUrl: "/" })}
                className="w-full"
                variant="outline"
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
              <Button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full"
                variant="outline"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </TabsContent>

            <TabsContent value="apikey" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">AI Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google AI</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apikey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apikey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleApiKeySignIn}
                className="w-full"
                disabled={!apiKey.trim() || !provider || isLoading}
              >
                <Key className="mr-2 h-4 w-4" />
                {isLoading ? "Authenticating..." : "Continue with API Key"}
              </Button>

              <p className="text-center text-muted-foreground text-xs">
                Your API key is encrypted and stored securely. We never access your provider account
                directly.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
