interface LineChartProps {
  data: number[]; // 최근 5일간의 데이터 (오래된 순서부터)
  width?: number;
  height?: number;
}

export default function LineChart({
  data,
  width = 64,
  height = 48,
}: LineChartProps) {
  if (data.length === 0) return null;

  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 데이터 정규화 (0-100 범위)
  const maxValue = Math.max(...data, 1); // 최소값 1로 설정하여 0으로 나누기 방지
  const normalizedData = data.map((value) => (value / maxValue) * 100);

  // 좌표 계산
  const points = normalizedData.map((value, index) => {
    const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
    const y = padding + chartHeight - (value / 100) * chartHeight;
    return { x, y };
  });

  // SVG path 생성
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* 그리드 라인 (선택사항) */}
        {/* <line
          x1={padding}
          y1={padding + chartHeight}
          x2={padding + chartWidth}
          y2={padding + chartHeight}
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200"
        /> */}

        {/* 꺾은선 */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />

        {/* 점 */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="currentColor"
            className="text-primary"
          />
        ))}
      </svg>
    </div>
  );
}
