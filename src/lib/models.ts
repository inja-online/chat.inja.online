import {
  Brain,
  Sparkles,
  Zap,
  Bot,
  Globe,
  Camera,
  FileText,
  FileCode,
  Mic,
  Video,
} from "lucide-react";

export interface ModelCapability {
  reasoning: boolean;
  vision: boolean;
  files: boolean;
  web: boolean;
  code: boolean;
  voice: boolean;
  video: boolean;
}

export interface ModelProvider {
  name: string;
  website: string;
  description: string;
}

export interface Model {
  value: string;
  label: string;
  provider: ModelProvider;
  icon: React.ComponentType<{ className?: string }>;
  capabilities: ModelCapability;
  contextWindow: string;
  description: string;
  pricing?: {
    input: string;
    output: string;
  };
}

export const MODEL_PROVIDERS: Record<string, ModelProvider> = {
  openai: {
    name: "OpenAI",
    website: "https://openai.com",
    description: "Leading AI research company",
  },
  anthropic: {
    name: "Anthropic",
    website: "https://anthropic.com",
    description: "AI safety focused research company",
  },
  google: {
    name: "Google",
    website: "https://deepmind.google",
    description: "Google's AI research division",
  },
  mistral: {
    name: "Mistral AI",
    website: "https://mistral.ai",
    description: "European AI company focused on efficiency",
  },
};

export const MODELS: Model[] = [
  {
    value: "gpt-4o",
    label: "GPT-4o",
    provider: MODEL_PROVIDERS.openai,
    icon: Sparkles,
    capabilities: {
      reasoning: true,
      vision: true,
      files: true,
      web: true,
      code: true,
      voice: true,
      video: false,
    },
    contextWindow: "128K",
    description: "Most capable multimodal model with advanced reasoning",
    pricing: {
      input: "$5/1M tokens",
      output: "$15/1M tokens",
    },
  },
  {
    value: "claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    provider: MODEL_PROVIDERS.anthropic,
    icon: Brain,
    capabilities: {
      reasoning: true,
      vision: true,
      files: true,
      web: false,
      code: true,
      voice: false,
      video: false,
    },
    contextWindow: "200K",
    description: "Best for reasoning, analysis, and code generation",
    pricing: {
      input: "$3/1M tokens",
      output: "$15/1M tokens",
    },
  },
  {
    value: "gemini-pro",
    label: "Gemini Pro",
    provider: MODEL_PROVIDERS.google,
    icon: Zap,
    capabilities: {
      reasoning: true,
      vision: true,
      files: true,
      web: true,
      code: true,
      voice: false,
      video: true,
    },
    contextWindow: "1M",
    description: "Largest context window with multimodal capabilities",
    pricing: {
      input: "$1.25/1M tokens",
      output: "$5/1M tokens",
    },
  },
  {
    value: "mistral-large",
    label: "Mistral Large",
    provider: MODEL_PROVIDERS.mistral,
    icon: Bot,
    capabilities: {
      reasoning: true,
      vision: false,
      files: true,
      web: false,
      code: true,
      voice: false,
      video: false,
    },
    contextWindow: "32K",
    description: "Fast and efficient with strong multilingual support",
    pricing: {
      input: "$4/1M tokens",
      output: "$12/1M tokens",
    },
  },
];

export const getCapabilityIcon = (capability: keyof ModelCapability) => {
  const icons = {
    reasoning: Brain,
    vision: Camera,
    files: FileText,
    web: Globe,
    code: FileCode,
    voice: Mic,
    video: Video,
  };
  return icons[capability];
};

export const getModelByValue = (value: string): Model | undefined => {
  return MODELS.find((model) => model.value === value);
};

export const getModelsByCapability = (
  capability: keyof ModelCapability
): Model[] => {
  return MODELS.filter((model) => model.capabilities[capability]);
};
