export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(await readableError(response));
  }

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON, got ${contentType || "unknown content type"}: ${preview(text)}`);
  }

  return response.json() as Promise<T>;
}

async function readableError(response: Response) {
  const text = await response.text();
  return text.trim() ? text : `Request failed with status ${response.status}`;
}

function preview(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 120);
}
