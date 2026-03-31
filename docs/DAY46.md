# Day 46 Learning Notes

## Why this implementation is needed
- Video uploads need a secure handoff to a provider.
- Validation prevents large or unsupported files.

## Advantages
- Clear API boundary for uploads.
- Immediate feedback for bad files.

## Disadvantages
- Upload URL is mocked, not real storage.

## Alternatives and tradeoffs
- Integrate S3 or Cloudflare directly.
- Use signed URLs from a provider SDK.

## Concepts and terms
- Upload URL: temporary endpoint for file upload.
- Content type: MIME type validation.

## Fundamentals
- Validate file size and type before upload.
- Keep URLs time-limited.
