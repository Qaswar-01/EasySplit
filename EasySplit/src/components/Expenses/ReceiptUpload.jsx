import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Eye, Loader, FileText, DollarSign } from 'lucide-react';
import Tesseract from 'tesseract.js';
import Button from '../UI/Button';

const ReceiptUpload = ({
  images = [],
  onImagesChange,
  onOCRResult,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    const newImages = [];
    let processedCount = 0;

    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: Date.now() + index,
          file,
          url: e.target.result,
          name: file.name,
          size: file.size,
          ocrText: null,
          extractedData: null
        };
        
        newImages.push(imageData);
        processedCount++;

        if (processedCount === imageFiles.length) {
          const updatedImages = [...images, ...newImages];
          onImagesChange(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const performOCR = async (imageData) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setOcrProgress(0);

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageData.url,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      // Extract useful information from OCR text
      const extractedData = extractReceiptData(text);
      
      // Update image with OCR results
      const updatedImages = images.map(img => 
        img.id === imageData.id 
          ? { ...img, ocrText: text, extractedData }
          : img
      );
      
      onImagesChange(updatedImages);
      
      // Notify parent component of extracted data
      if (onOCRResult && extractedData) {
        onOCRResult(extractedData);
      }

    } catch (error) {
      console.error('OCR failed:', error);
      alert('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const extractReceiptData = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const extractedData = {
      amount: null,
      description: null,
      date: null,
      merchant: null
    };

    // Extract amount (look for currency symbols and numbers)
    const amountPatterns = [
      /(?:₨|Rs\.?|PKR)\s*(\d+(?:[,.]?\d+)*(?:\.\d{2})?)/i,
      /(\d+(?:[,.]?\d+)*(?:\.\d{2})?)\s*(?:₨|Rs\.?|PKR)/i,
      /(?:total|amount|sum)[\s:]*(?:₨|Rs\.?|PKR)?\s*(\d+(?:[,.]?\d+)*(?:\.\d{2})?)/i,
      /(\d+(?:[,.]?\d+)*\.\d{2})/g
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1] || match[0];
        const amount = parseFloat(amountStr.replace(/[,]/g, ''));
        if (amount > 0 && amount < 1000000) { // Reasonable amount range
          extractedData.amount = amount;
          break;
        }
      }
    }

    // Extract merchant/store name (usually first few lines)
    if (lines.length > 0) {
      // Look for common merchant indicators
      const merchantLine = lines.find(line => 
        line.length > 3 && 
        line.length < 50 && 
        !line.match(/\d{4}/) && // Avoid dates
        !line.match(/₨|Rs|PKR|\d+\.\d{2}/) // Avoid amounts
      );
      
      if (merchantLine) {
        extractedData.merchant = merchantLine;
        extractedData.description = `Purchase from ${merchantLine}`;
      }
    }

    // Extract date
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4})/i,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          extractedData.date = date.toISOString().split('T')[0];
          break;
        }
      }
    }

    return extractedData;
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Receipt Upload & OCR
        </h3>
        {isProcessing && (
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <Loader className="w-4 h-4 mr-1 animate-spin" />
            Processing... {ocrProgress}%
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled 
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {disabled ? 'Upload disabled' : 'Drop receipt images here or click to browse'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Supports JPG, PNG, WebP • Max 5MB per file
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Uploaded Images */}
      <AnimatePresence>
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-4"
          >
            <div className="flex items-start space-x-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                  onClick={() => setPreviewImage(image)}
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Image Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {image.name}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(image.size)}
                  </span>
                </div>

                {/* OCR Results */}
                {image.extractedData && (
                  <div className="space-y-2 mb-3">
                    {image.extractedData.amount && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Amount: <strong>₨{image.extractedData.amount}</strong>
                        </span>
                      </div>
                    )}
                    {image.extractedData.merchant && (
                      <div className="flex items-center text-sm">
                        <FileText className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Merchant: <strong>{image.extractedData.merchant}</strong>
                        </span>
                      </div>
                    )}
                    {image.extractedData.date && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          Date: <strong>{new Date(image.extractedData.date).toLocaleDateString()}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => performOCR(image)}
                    disabled={isProcessing}
                    icon={<FileText className="w-3 h-3" />}
                  >
                    {image.ocrText ? 'Re-scan' : 'Extract Text'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewImage(image)}
                    icon={<Eye className="w-3 h-3" />}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* OCR Text Preview */}
            {image.ocrText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    View Extracted Text
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{image.ocrText}</pre>
                  </div>
                </details>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiptUpload;
