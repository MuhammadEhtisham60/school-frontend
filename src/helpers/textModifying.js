// utils/stringUtils.js
export const capitalizeFirstLetter = (value = '') => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};
export const formatFileNameFromUrl = (url = '') => {
  if (!url) return '';

  // Extract filename
  const match = url.match(/\/([^\/?#]+)(?:\?|#|$)/);
  if (!match) return '';

  const fileName = decodeURIComponent(match[1]);

  // Split name and extension
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return fileName;

  const name = fileName.slice(0, lastDotIndex);
  const extension = fileName.slice(lastDotIndex); // includes dot

  // If name is short, return as is
  if (name.length <= 13) return fileName;

  const firstPart = name.slice(0, 12);
  const lastCharBeforeDot = name.slice(-1);

  return `${firstPart}...${lastCharBeforeDot}${extension}`;
};


export const formatTextChatTitle = (text = '', limit = 20) => {
  if (!text) return '';

  const formatted =
    text.charAt(0).toUpperCase() + text.slice(1);

  return formatted.length > limit
    ? formatted.slice(0, limit) + '...'
    : formatted;
};



export const formatLabel = (text) => {
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};



export const formatLabeltoLower = (text) => {
  if (!text) return ''; // handle undefined, null, empty

  return text
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
