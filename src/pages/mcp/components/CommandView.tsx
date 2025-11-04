import { Copy } from "lucide-react";

interface CommandViewProps {
  onCopyCommand: (command: string) => void;
}

const COMMANDS = [
  { text: "npm i -g @atrina/cli", label: "Atrina CLI 설치" },
  { text: "atrina init HVN9", label: "프로젝트 초기화" },
];

export default function CommandView({ onCopyCommand }: CommandViewProps) {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-8">
        다음 명령어를 터미널에서 실행하세요:
      </h2>

      <div className="space-y-4">
        {COMMANDS.map((cmd) => (
          <div
            key={cmd.text}
            className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => onCopyCommand(cmd.text)}
          >
            <div className="flex items-center justify-between">
              <code>{cmd.text}</code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyCommand(cmd.text);
                }}
                className="ml-4 p-2 hover:bg-gray-800 rounded transition-colors"
                aria-label="복사"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-base text-gray-600 text-center">
        <p>
          위 명령어를 터미널에서 순서대로 실행한 후, 완료 버튼을 클릭하세요.
        </p>
      </div>
    </div>
  );
}
