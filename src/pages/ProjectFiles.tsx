import { FileText, Image, FileCode, Archive, Download, Eye } from 'lucide-react';
import type { Project } from '../types';
import { formatDate } from '../utils/helpers';

interface Props {
  project: Project;
}

interface MockFile {
  id: string;
  name: string;
  type: 'doc' | 'image' | 'code' | 'archive';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const mockFiles: MockFile[] = [
  { id: 'f1', name: 'Project_Brief_v2.pdf', type: 'doc', size: '2.4 MB', uploadedBy: 'Alex Johnson', uploadedAt: '2026-05-10' },
  { id: 'f2', name: 'Homepage_Mockup_Final.fig', type: 'image', size: '8.7 MB', uploadedBy: 'Emily Watson', uploadedAt: '2026-05-08' },
  { id: 'f3', name: 'API_Documentation.md', type: 'code', size: '45 KB', uploadedBy: 'Marcus Rivera', uploadedAt: '2026-05-05' },
  { id: 'f4', name: 'Design_Assets.zip', type: 'archive', size: '34.2 MB', uploadedBy: 'Emily Watson', uploadedAt: '2026-05-03' },
  { id: 'f5', name: 'Sprint_1_Report.docx', type: 'doc', size: '1.1 MB', uploadedBy: 'Sarah Chen', uploadedAt: '2026-04-30' },
  { id: 'f6', name: 'Component_Library.png', type: 'image', size: '3.8 MB', uploadedBy: 'Emily Watson', uploadedAt: '2026-04-28' },
  { id: 'f7', name: 'Database_Schema.sql', type: 'code', size: '12 KB', uploadedBy: 'David Park', uploadedAt: '2026-04-25' },
];

const fileIconMap = {
  doc: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  image: { icon: Image, color: 'text-pink-500', bg: 'bg-pink-50' },
  code: { icon: FileCode, color: 'text-green-500', bg: 'bg-green-50' },
  archive: { icon: Archive, color: 'text-yellow-500', bg: 'bg-yellow-50' },
};

export default function ProjectFiles(_: Props) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Files ({mockFiles.length})</h2>
        <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
          Upload File
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockFiles.map((file) => {
              const { icon: Icon, color, bg } = fileIconMap[file.type];
              return (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={color} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{file.size}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{file.uploadedBy}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(file.uploadedAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
