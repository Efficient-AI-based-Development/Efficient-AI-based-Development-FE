import { X, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewActionButtonsProps {
  onReject?: () => void;
  onApprove?: () => void;
  onAddMore?: () => void;
}

export default function ReviewActionButtons({
  onReject,
  onApprove,
  onAddMore,
}: ReviewActionButtonsProps) {
  return (
    <div className="w-full flex justify-end gap-3">
      <Button onClick={onReject} variant="outline" className="px-8">
        <X className="w-4 h-4 mr-2" />
        거절
      </Button>
      <Button onClick={onAddMore} variant="outline" className="px-8">
        <Plus className="w-4 h-4 mr-2" />
        추가하기
      </Button>
      <Button
        onClick={onApprove}
        className="px-8 bg-primary text-white hover:bg-primary/90 outline-none focus:outline-none focus-visible:outline-none"
      >
        <Check className="w-4 h-4 mr-2" />
        수락
      </Button>
    </div>
  );
}
