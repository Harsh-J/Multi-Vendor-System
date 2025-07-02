export default function cleanData(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      clean[key] = value
        .trim()
        .replace(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          "[email redacted]"
        );
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
