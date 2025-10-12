// This is a placeholder for a chart. For a real implementation,
// you would use a library like Recharts, Chart.js, or Visx.

interface ProgressPoint {
  date: string;
  ndvi: number;
}

export default function ProgressChart({ data }: { data: ProgressPoint[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Regeneration Progress (NDVI)</h3>
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-md">
        <p className="text-gray-500">Chart will be displayed here.</p>
      </div>
    </div>
  );
}