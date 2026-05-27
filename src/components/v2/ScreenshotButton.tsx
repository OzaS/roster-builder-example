import { Camera } from "lucide-react";

type Props = {
  onCapture: () => void;
};

export function ScreenshotButton({ onCapture }: Props) {
  return (
    <section className="screenshot-actions">
      <h3>Action</h3>
      <button type="button" onClick={onCapture}>
        <Camera size={16} />
        Screenshot
      </button>
    </section>
  );
}
