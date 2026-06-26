import { Camera } from "lucide-react";

type Props = {
  onCapture: () => void;
};

export function ScreenshotButton({ onCapture }: Props) {
  return (
    <button className="rail-icon-button" type="button" onClick={onCapture} aria-label="Take screenshot" title="Take screenshot">
      <Camera size={17} />
    </button>
  );
}
