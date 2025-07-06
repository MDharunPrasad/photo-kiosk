import React, { useState } from 'react';
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [isEditorShown, setIsEditorShown] = useState(true);

  const handleSave = (editedImageObject: any, designState: any) => {
    console.log('Image saved', editedImageObject, designState);
    
    // The editedImageObject contains the edited image data
    // Get the image URL from the edited object
    const editedImageUrl = editedImageObject.imageBase64 || editedImageObject.fullName || imageUrl;
    
    onSave(editedImageUrl);
    setIsEditorShown(false);
  };

  const handleClose = () => {
    setIsEditorShown(false);
    onCancel();
  };

  if (!isEditorShown) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-photobooth-primary mb-4">Photo Editor</h2>
          <p className="text-gray-600 mb-6">Editor closed. Click back to return to photos.</p>
          <Button onClick={onCancel} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Photos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <FilerobotImageEditor
        source={imageUrl}
        onSave={handleSave}
        onClose={handleClose}
        annotationsCommon={{
          fill: '#3b82f6'
        }}
        Text={{ 
          text: 'Photo Kiosk...',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#3b82f6'
        }}
        Rotate={{ 
          angle: 90, 
          componentType: 'slider' 
        }}
        tabsIds={[
          TABS.ADJUST,     // Brightness, Contrast, Saturation, etc.
          TABS.FILTERS,    // Color filters
          TABS.FINETUNE,   // Fine-tune adjustments
          TABS.ANNOTATE,   // Text, shapes, arrows
          TABS.WATERMARK,  // Add watermarks
          TABS.RESIZE      // Resize and crop
        ]}
        defaultTabId={TABS.ADJUST}
        defaultToolId={TOOLS.BRIGHTNESS}
        showBackButton={true}
        translations={{
          'common.back': 'Back to Photos',
          'common.save': 'Save Photo',
          'common.cancel': 'Cancel',
          'toolbar.download': 'Save & Continue'
        }}
        theme={{
          palette: {
            'bg-primary': '#ffffff',
            'bg-secondary': '#f8fafc',
            'accent-primary': '#3b82f6',
            'accent-primary-hover': '#2563eb',
            'accent-secondary': '#64748b',
            'icons-primary': '#475569',
            'icons-secondary': '#64748b',
            'borders-secondary': '#e2e8f0',
            'light-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            'warning': '#f59e0b'
          }
        }}
        useBackendTranslations={false}
        loadableDesignState={undefined}
        avoidChangesNotSavedAlertOnLeave={false}
        savingPixelRatio={1}
        previewPixelRatio={1}
        observePluginContainerSize={true}
        showCanvasOnly={false}
        useCloudimage={false}
        cloudimageToken=""
        moreSaveOptions={[]}
        closeAfterSave={true}
        defaultSavedImageName="edited-photo"
        defaultSavedImageType="png"
        forceToPngInEllipticalCrop={false}
        enableImageRevision={false}
        imageRevisionSliderStep={0.1}
        replaceCloseWithBackButton={false}
        onBeforeSave={() => {
          console.log('About to save image');
          return true;
        }}
      />
    </div>
  );
};

export default PhotoEditor;
