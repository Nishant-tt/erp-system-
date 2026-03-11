export function downloadAxiosBlobResponse(response, fallbackFilename = "document") {
  const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data || ""]);

  // Try to read filename from Content-Disposition: attachment; filename="X.pdf"
  const cd = response?.headers?.["content-disposition"] || response?.headers?.["Content-Disposition"];
  let filename = fallbackFilename;
  if (cd) {
    const match = /filename\\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(cd);
    filename = decodeURIComponent(match?.[1] || match?.[2] || filename);
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

