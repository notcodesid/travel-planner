'use client';

import { useState } from 'react';
import { X, Copy, Facebook, Twitter, Mail, Link, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

export default function ShareModal({ isOpen, onClose, tripId, tripTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/trip/${tripId}`;
  const shareText = `Check out my ${tripTitle} itinerary created with TrailMix!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`My ${tripTitle} Travel Itinerary`)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${tripTitle} Travel Itinerary`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Native share failed:', err);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-montserrat font-semibold text-[28px] text-black dark:text-white mb-2">
            Share Your Trip
          </h2>
          <p className="font-poppins text-[#666] dark:text-[#B0B0B0]">
            Let others discover your amazing {tripTitle} adventure
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Copy Link */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-poppins text-sm font-medium text-black dark:text-white mb-1">
                  Share link
                </p>
                <p className="text-[#666] dark:text-[#B0B0B0] text-sm truncate">
                  {shareUrl}
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="ml-3 flex items-center gap-2 px-4 py-2 bg-[#CCF83B] hover:bg-[#B8E635] text-black rounded-lg font-poppins font-medium text-sm transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <Twitter size={20} className="text-[#1DA1F2]" />
              <span className="font-poppins font-medium text-black dark:text-white">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <Facebook size={20} className="text-[#1877F2]" />
              <span className="font-poppins font-medium text-black dark:text-white">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <Mail size={20} className="text-[#EA4335]" />
              <span className="font-poppins font-medium text-black dark:text-white">Email</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <Link size={20} className="text-[#666] dark:text-[#B0B0B0]" />
              <span className="font-poppins font-medium text-black dark:text-white">More</span>
            </button>
          </div>
        </div>

        {/* QR Code Option */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <div className="text-center">
            <button
              onClick={() => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
                const qrWindow = window.open('', '_blank');
                if (qrWindow) {
                  qrWindow.document.write(`
                    <html>
                      <head><title>QR Code - ${tripTitle}</title></head>
                      <body style="display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5;">
                        <div style="text-align: center; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          <h2 style="margin: 0 0 20px 0; color: #333;">Scan to view trip</h2>
                          <img src="${qrUrl}" alt="QR Code" style="border-radius: 8px;" />
                          <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">Share this QR code with friends</p>
                        </div>
                      </body>
                    </html>
                  `);
                }
              }}
              className="text-[#0066CC] hover:underline font-poppins text-sm"
            >
              Generate QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}