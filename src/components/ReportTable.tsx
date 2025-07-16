import React from 'react';

interface ReportTableProps {
  /*
    Accepts array of objects to render as table. If data is not
    an array of plain objects, falls back to JSON display.
   */
  data: unknown;
}

function isRecordArray(data: unknown): data is Record<string, unknown>[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    !Array.isArray(data[0])
  );
}

export const ReportTable: React.FC<ReportTableProps> = ({ data }) => {
  if (!isRecordArray(data)) {
    return (
      <pre className="text-sm whitespace-pre-wrap break-all bg-gray-50 p-3 rounded-md border border-gray-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-700 font-semibold">
            {headers.map((h) => (
              <th key={h} className="py-2 px-3 border border-gray-200">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {headers.map((h) => (
                <td key={h} className="py-2 px-3 border border-gray-200">
                  {String((row as Record<string, unknown>)[h] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
