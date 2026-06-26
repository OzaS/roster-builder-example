import { toPng } from "html-to-image";

export async function captureElementAsPng(element: HTMLElement, fileName: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: getComputedStyle(element).backgroundColor || "#eef1f3",
  });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
