import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {FridgePhoto} from '../types';

function fromAsset(asset?: {
  uri?: string;
  base64?: string;
  type?: string;
  fileSize?: number;
}): FridgePhoto | null {
  if (!asset?.uri) {
    return null;
  }
  if (asset.fileSize && asset.fileSize > 4 * 1024 * 1024) {
    throw new Error('Please pick a photo under 4 MB.');
  }
  return {
    uri: asset.uri,
    base64: asset.base64,
    mimeType: asset.type || 'image/jpeg',
  };
}

export async function pickFridgePhoto(
  source: 'camera' | 'library',
): Promise<FridgePhoto | null> {
  const options = {
    mediaType: 'photo' as const,
    quality: 0.7 as const,
    includeBase64: true,
    selectionLimit: 1,
  };

  const result =
    source === 'camera'
      ? await launchCamera(options)
      : await launchImageLibrary(options);

  if (result.didCancel) {
    return null;
  }
  if (result.errorMessage) {
    throw new Error(result.errorMessage);
  }
  return fromAsset(result.assets?.[0]);
}
