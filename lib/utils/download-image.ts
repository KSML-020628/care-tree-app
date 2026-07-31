/** data URL 이미지를 브라우저의 "다른 이름으로 저장" 없이 바로 기기에 내려받는다. */
export function downloadDataUrlImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
