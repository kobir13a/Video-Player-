
import React, { useRef, useState, useMemo } from 'react';
import { Play, Plus, Video, Folder, ArrowLeft, MoreVertical, Search, HardDrive } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoLibraryProps {
  videos: VideoFile[];
  onAddVideos: (videos: VideoFile[]) => void;
  onPlayVideo: (index: number) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos, onAddVideos, onPlayVideo }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);

  // Group videos by folder name
  const folders = useMemo(() => {
    const group: Record<string, VideoFile[]> = {};
    videos.forEach(video => {
      if (!group[video.folderName]) {
        group[video.folderName] = [];
      }
      group[video.folderName].push(video);
    });
    return group;
  }, [videos]);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Cast filesArray to any[] to avoid 'unknown' type error when accessing properties like 'type'
      const filesArray = Array.from(e.target.files) as any[];
      const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
      
      const newVideos: VideoFile[] = videoFiles.map((file: any) => {
        // Extract folder name from relative path (webkitRelativePath)
        const pathParts = file.webkitRelativePath.split('/');
        const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Internal Storage';
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          url: URL.createObjectURL(file),
          type: file.type,
          lastModified: file.lastModified,
          folderName: folderName,
          relativePath: file.webkitRelativePath
        };
      });
      
      onAddVideos(newVideos);
    }
  };

  const filteredVideos = selectedFolderName ? folders[selectedFolderName] : [];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-gray-100">
      {/* Dynamic Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-[#111] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {selectedFolderName ? (
            <button 
              onClick={() => setSelectedFolderName(null)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Play className="text-white fill-current" size={20} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {selectedFolderName || 'V-Player Pro'}
            </h1>
            {!selectedFolderName && <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Local Library</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!selectedFolderName && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all active:scale-95 font-medium text-sm shadow-lg shadow-blue-600/20"
            >
              <HardDrive size={18} />
              <span className="hidden sm:inline">স্টোরেজ সিলেক্ট করুন</span>
            </button>
          )}
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Search size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Hidden Directory Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          webkitdirectory="true" 
          directory="" 
          multiple 
          onChange={handleFolderSelect}
        />

        {videos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6 px-10">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-600/10 rounded-full flex items-center justify-center animate-pulse">
                <Folder size={64} className="text-blue-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-300">কোনো ভিডিও নেই</p>
              <p className="text-sm leading-relaxed max-w-xs">
                ফোনের ভিডিও ফোল্ডারটি সিলেক্ট করতে উপরের বাটনে ক্লিক করুন। MX Player এর মতো সব ভিডিও ফোল্ডার অনুযায়ী দেখা যাবে।
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {!selectedFolderName ? (
              /* FOLDERS VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.keys(folders).map(folderName => (
                  <div 
                    key={folderName}
                    onClick={() => setSelectedFolderName(folderName)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[#161616] hover:bg-[#202020] border border-gray-800/50 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Folder size={28} fill="currentColor" className="opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-200 truncate">{folderName}</h3>
                      <p className="text-xs text-gray-500 font-medium">{folders[folderName].length} টি ভিডিও</p>
                    </div>
                    <MoreVertical size={18} className="text-gray-600" />
                  </div>
                ))}
              </div>
            ) : (
              /* VIDEOS WITHIN FOLDER VIEW */
              <div className="flex flex-col gap-1">
                {filteredVideos.map((video) => (
                  <div 
                    key={video.id}
                    onClick={() => {
                      const globalIndex = videos.findIndex(v => v.id === video.id);
                      onPlayVideo(globalIndex);
                    }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                  >
                    <div className="relative w-28 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-gray-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video size={24} className="text-gray-700 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={20} fill="white" className="text-white" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-300">
                        {video.size}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-200 truncate leading-snug">{video.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-tighter">
                        {new Date(video.lastModified).toLocaleDateString()} • {video.type.split('/')[1]}
                      </p>
                    </div>
                    <button className="p-2 text-gray-600 hover:text-gray-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tab Bar Simulation */}
      {!selectedFolderName && videos.length > 0 && (
        <nav className="flex items-center justify-around py-3 px-6 bg-[#111] border-t border-gray-800">
          <div className="flex flex-col items-center gap-1 text-blue-500">
            <Folder size={20} fill="currentColor" />
            <span className="text-[10px] font-bold">ফোল্ডার</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-600">
            <Video size={20} />
            <span className="text-[10px] font-bold">ভিডিও</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-600">
            <Play size={20} />
            <span className="text-[10px] font-bold">রিসেন্ট</span>
          </div>
        </nav>
      )}
    </div>
  );
};

export default VideoLibrary;
