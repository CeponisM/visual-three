import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { X, Image, Video, Music } from 'lucide-react';

const Media = () => {
  const [mediaFiles, setMediaFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
      setMediaFiles(prevFiles => [...prevFiles, ...newFiles]);
    },
    accept: {
      'image/*': [],
      'audio/*': [],
      'video/*': []
    }
  });

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleRemove = (id) => {
    setMediaFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const getIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6" />;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div
        {...getRootProps()}
        className="p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
      >
        <input {...getInputProps()} />
        <p className="text-center text-gray-400">Drag & drop media here, or click to select files</p>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Media Library</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaFiles.map((file) => (
            <motion.div
              key={file.id}
              className="relative group bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              draggable
              onDragStart
              onDragStart={(e) => handleDragStart(e, file)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="aspect-w-16 aspect-h-9">
                {file.file.type.startsWith('image/') && (
                  <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                )}
                {file.file.type.startsWith('video/') && (
                  <video src={file.preview} className="w-full h-full object-cover" />
                )}
                {file.file.type.startsWith('audio/') && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-600">
                    {getIcon(file.file.type)}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-sm font-medium truncate text-gray-300">{file.file.name}</p>
                <p className="text-xs text-gray-400">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => handleRemove(file.id)}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Media;
