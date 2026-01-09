# Image Generation Guidance

This project may generate images for covers, stimuli, or share previews. Follow these rules.

## Model Selection
- Default to OpenAI `gpt-image-1` via `OPENAI_IMAGE_MODEL`.
- If using Gemini, set `GOOGLE_API_KEY` and `GEMINI_IMAGE_MODEL`.

## Prompt Guidelines
- Photorealistic, high-contrast editorial imagery.
- No text, logos, UI, or watermarks.
- Avoid identifiable faces unless explicitly required.
- Avoid generic "futuristic tech" unless the context calls for it.

## OpenAI Image Generation (Recommended)
- Use `images.generate` with:
  - `model: OPENAI_IMAGE_MODEL`
  - `prompt: <coverImagePrompt>`
  - `size: "1024x1024"`
- Decode `b64_json` to a buffer.
- Detect content type and upload to GCS/S3 before storing URLs.
- If image generation fails, log and continue without blocking.

## Gemini Image Generation (Optional)
- Call `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`.
- Provide a `contents` array with a single user text prompt.
- Extract `inlineData` base64 from the response and detect content type.

## Storage Requirements
- Require `GCS_BUCKET` (or equivalent object store) to persist images.
- Use a stable key format: `covers/<slug>.<ext>` or `stimuli/<id>.<ext>`.

## Fallback Strategy
1. Reuse a repo image if available.
2. Use a local asset pipeline (optional).
3. Generate with OpenAI or Gemini.
4. If all fail, skip image generation and continue.
