"use client";

interface NotificationModalProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export function NotificationModal({
  type,
  message,
  onClose,
}: NotificationModalProps) {
  const isSuccess = type === "success";
  const borderColor = isSuccess ? "border-green-500" : "border-red-500";
  const textColor = isSuccess ? "text-green-500" : "text-red-500";
  const title = isSuccess ? "ACCESS GRANTED" : "ACCESS DENIED";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-black ${borderColor} p-4 rounded max-w-sm border-2`}>
        <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{title}</h3>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 border ${borderColor} rounded hover:bg-${textColor}/10 ${textColor}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
