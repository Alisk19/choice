export const STANDARD_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Vivo',
  'Oppo',
  'OnePlus',
  'Realme',
  'Motorola',
  'Google',
  'Nothing',
  'Tecno',
  'iQOO',
  'Infinix',
  'Redmi'
];

const brandMap = {
  'apple': 'Apple',
  'iphone': 'Apple',
  'i phone': 'Apple',
  'samsung': 'Samsung',
  'xiaomi': 'Xiaomi',
  'mi': 'Xiaomi',
  'redmi': 'Redmi',
  'vivo': 'Vivo',
  'oppo': 'Oppo',
  'oneplus': 'OnePlus',
  '1+': 'OnePlus',
  'one plus': 'OnePlus',
  'realme': 'Realme',
  'motorola': 'Motorola',
  'moto': 'Motorola',
  'google': 'Google',
  'pixel': 'Google',
  'nothing': 'Nothing',
  'tecno': 'Tecno',
  'iqoo': 'iQOO',
  'infinix': 'Infinix'
};

export const normalizeBrand = (rawBrand) => {
  if (!rawBrand) return 'Other';
  
  const lowerBrand = rawBrand.trim().toLowerCase();
  
  if (brandMap[lowerBrand]) {
    return brandMap[lowerBrand];
  }

  const words = lowerBrand.split(' ');
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
