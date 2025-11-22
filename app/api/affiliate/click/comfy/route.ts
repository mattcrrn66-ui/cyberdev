import { NextResponse } from "next/server";

/**
 * Full CyberDev workflow, based on your CyberDev.json.
 * This is wrapped under `prompt` because Comfy's /prompt
 * endpoint expects { prompt: { ...nodes... } }.
 */
const cyberDevWorkflow: Record<string, any> = {
  prompt: {
    "10": {
      "inputs": {
        "ckpt_name": "Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors"
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint"
      }
    },
    "11": {
      "inputs": {
        "text":
          "hyper-realistic portrait of a smiling young woman with big blonde pigtails wearing a pink dress, standing in a colorful field, soft studio lighting, 4k, highly detailed, cinematic, flux style",
        "clip": ["10", 1]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "14": {
      "inputs": {
        "text":
          "blurry, low resolution, distorted face, extra limbs, text, watermark, oversaturated, jpeg artifacts",
        "clip": ["10", 1]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "17": {
      "inputs": {
        "ip_scale": 0.93,
        "ip_adapter_flux": ["18", 0],
        "image": ["19", 0]
      },
      "class_type": "ApplyFluxIPAdapter",
      "_meta": {
        "title": "Apply Flux IPAdapter"
      }
    },
    "18": {
      "inputs": {
        "ipadatper": "ip_adapter.safetensors",
        "clip_vision": "clip_vision_flux.safetensors",
        "provider": "GPU"
      },
      "class_type": "LoadFluxIPAdapter",
      "_meta": {
        "title": "Load Flux IPAdatpter"
      }
    },
    "19": {
      "inputs": {
        "image": "example.png"
      },
      "class_type": "LoadImage",
      "_meta": {
        "title": "Load Image"
      }
    },
    "20": {
      "inputs": {
        "seed": 995294525731129,
        "steps": 20,
        "cfg": 8,
        "sampler_name": "euler",
        "scheduler": "simple",
        "denoise": 1,
        "model": ["10", 0],
        "positive": ["11", 0],
        "negative": ["14", 0],
        "latent_image": ["21", 0]
      },
      "class_type": "KSampler",
      "_meta": {
        "title": "KSampler"
      }
    },
    "21": {
      "inputs": {
        "width": 512,
        "height": 512,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage",
      "_meta": {
        "title": "Empty Latent Image"
      }
    },
    "22": {
      "inputs": {
        "samples": ["20", 0],
        "vae": ["10", 2]
      },
      "class_type": "VAEDecode",
      "_meta": {
        "title": "VAE Decode"
      }
    },
    "23": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": ["22", 0]
      },
      "class_type": "SaveImage",
      "_meta": {
        "title": "Save Image"
      }
    }
  }
};

const COMFY_URL = process.env.COMFY_URL!;
const PROMPT_NODE_ID = "11"; // your positive CLIP TextEncode node

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const userPrompt: string = body?.prompt || "girl on couch";

    if (!COMFY_URL) {
      return NextResponse.json(
        { ok: false, error: "COMFY_URL env var is missing on the server" },
        { status: 500 }
      );
    }

    // Deep clone so we don't mutate the base workflow
    const workflow: any = JSON.parse(JSON.stringify(cyberDevWorkflow));

    // Inject the user prompt into node 11
    if (
      workflow.prompt &&
      workflow.prompt[PROMPT_NODE_ID] &&
      workflow.prompt[PROMPT_NODE_ID].inputs
    ) {
      workflow.prompt[PROMPT_NODE_ID].inputs.text = userPrompt;
    }

    const res = await fetch(COMFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workflow),
    });

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const json = isJson ? await res.json().catch(() => null) : null;
    const text = !isJson ? await res.text().catch(() => null) : null;

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        contentType,
        json,
        text,
      },
      { status: res.ok ? 200 : res.status }
    );
  } catch (err: any) {
    console.error("Comfy proxy error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Comfy generation failed",
      },
      { status: 500 }
    );
  }
}
