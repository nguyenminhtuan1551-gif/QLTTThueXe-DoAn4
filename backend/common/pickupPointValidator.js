const https = require('https');

const GEOCODING_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const GEOCODING_TIMEOUT_MS = 5000;

const VIETNAM_LOCATION_INDICATORS = [
  // Miền Bắc
  'ha noi', 'hanoi', 'ba dinh', 'hoan kiem', 'dong da', 'hai ba trung', 'cau giay',
  'thanh xuan', 'hoang mai', 'long bien', 'tay ho', 'ha dong', 'nam tu liem', 'bac tu liem',
  'dong anh', 'gia lam', 'soc son', 'me linh', 'noi bai', 'hai phong', 'quang ninh', 'ha long',
  'bac ninh', 'hai duong', 'hung yen', 'nam dinh', 'thai binh', 'vinh phuc', 'phu tho',
  'ninh binh', 'thanh hoa', 'nghe an', 'vinh', 'ha tinh',
  // Miền Trung & Tây Nguyên
  'da nang', 'danang', 'hai chau', 'son tra', 'ngu hanh son', 'thanh khe', 'cam le',
  'hue', 'thua thien hue', 'quang nam', 'hoi an', 'quang ngai', 'binh dinh', 'quy nhon',
  'phu yen', 'tuy hoa', 'khanh hoa', 'nha trang', 'cam ranh', 'ninh thuan', 'phan rang',
  'binh thuan', 'phan thiet', 'kon tum', 'gia lai', 'pleiku', 'dak lak', 'buon ma thuot',
  'lam dong', 'da lat', 'bao loc',
  // Miền Nam & Tây Nam Bộ
  'ho chi minh', 'tp hcm', 'tphcm', 'sai gon', 'quan 1', 'quan 3', 'quan 7', 'tan binh',
  'binh thanh', 'thu duc', 'go vap', 'phu nhuan', 'tan son nhat', 'binh duong', 'thu dau mot',
  'thuan an', 'di an', 'dong nai', 'bien hoa', 'long thanh', 'ba ria', 'vung tau',
  'tay ninh', 'binh phuoc', 'long an', 'tien giang', 'my tho', 'ben tre', 'tra vinh',
  'vinh long', 'dong thap', 'an giang', 'kien giang', 'rach gia', 'phu quoc',
  'can tho', 'ninh kieu', 'hau giang', 'soc trang', 'bac lieu', 'ca mau',
  // Từ khóa nhận diện chung
  'viet nam', 'vietnam', 'san bay', 'ben xe', 'ga tau', 'phuong', 'quan', 'huyen', 'xa',
  'duong', 'pho', 'thi xa', 'thanh pho', 'tinh'
];

const OUTSIDE_VIETNAM_INDICATORS = [
  'nuoc ngoai',
  'singapore',
  'thailand',
  'bangkok',
  'japan',
  'tokyo',
  'korea',
  'seoul',
  'usa',
  'new york',
  'california',
  'paris',
  'france',
  'london',
  'england',
  'uk',
  'germany',
  'berlin',
  'china',
  'beijing',
  'shanghai',
  'australia',
  'sydney',
  'canada',
  'laos',
  'cambodia',
];

const geocodingCache = new Map();

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/đ/g, 'd')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectStrings(value, bucket = []) {
  if (typeof value === 'string') {
    bucket.push(value);
    return bucket;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, bucket));
    return bucket;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, bucket));
  }

  return bucket;
}

function hasKeyword(value, keywords = []) {
  return keywords.some((keyword) => value.includes(keyword));
}

function buildGeocodingUrl(pickupPoint) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  const contactEmail = process.env.NOMINATIM_EMAIL || 'contact@carhire.vn';

  url.searchParams.set('format', 'geocodejson');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'vn');
  url.searchParams.set('email', contactEmail);
  url.searchParams.set('q', pickupPoint);

  return {
    url,
    contactEmail,
  };
}

function requestJson(url, contactEmail) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          'User-Agent': process.env.NOMINATIM_USER_AGENT || `CarHire/1.0 (${contactEmail})`,
          Accept: 'application/json',
          'Accept-Language': 'vi,en;q=0.8',
        },
      },
      (response) => {
        let rawData = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          rawData += chunk;
        });
        response.on('end', () => {
          if (response.statusCode !== 200) {
            const error = new Error(`Geocoding request failed with status ${response.statusCode}`);
            error.statusCode = response.statusCode;
            reject(error);
            return;
          }

          try {
            resolve(JSON.parse(rawData));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.setTimeout(GEOCODING_TIMEOUT_MS, () => {
      request.destroy(new Error('Geocoding request timed out'));
    });
    request.on('error', reject);
  });
}

function getCachedResult(cacheKey) {
  const cachedValue = geocodingCache.get(cacheKey);

  if (!cachedValue) {
    return null;
  }

  if (Date.now() - cachedValue.createdAt > GEOCODING_CACHE_TTL_MS) {
    geocodingCache.delete(cacheKey);
    return null;
  }

  return cachedValue.result;
}

function setCachedResult(cacheKey, result) {
  geocodingCache.set(cacheKey, {
    createdAt: Date.now(),
    result,
  });
}

function analyzeGeocodingPayload(payload) {
  const geocoding = payload?.features?.[0]?.properties?.geocoding;

  if (!geocoding) {
    return {
      found: false,
      isInVietnam: false,
    };
  }

  const normalizedValues = collectStrings(geocoding).map(normalizeText);
  const combinedValue = normalizedValues.join(' | ');
  const countryCode = normalizeText(geocoding.country_code);
  const isInVietnam =
    countryCode === 'vn' || combinedValue.includes('viet nam') || combinedValue.includes('vietnam');

  return {
    found: true,
    isInVietnam,
  };
}

async function geocodePickupPoint(pickupPoint) {
  const cacheKey = normalizeText(pickupPoint);
  const cachedResult = getCachedResult(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const { url, contactEmail } = buildGeocodingUrl(pickupPoint);
  const payload = await requestJson(url, contactEmail);
  const result = analyzeGeocodingPayload(payload);
  setCachedResult(cacheKey, result);
  return result;
}

async function verifyPickupPointInHanoi(pickupPoint) {
  const trimmedPickupPoint = String(pickupPoint || '').trim();
  const normalizedPickupPoint = normalizeText(trimmedPickupPoint);

  if (!trimmedPickupPoint || trimmedPickupPoint.length < 5) {
    return { status: 'empty' };
  }

  if (hasKeyword(normalizedPickupPoint, OUTSIDE_VIETNAM_INDICATORS)) {
    return { status: 'outside' };
  }

  // Nếu địa chỉ chứa bất kỳ từ khóa địa danh nào tại Việt Nam
  if (hasKeyword(normalizedPickupPoint, VIETNAM_LOCATION_INDICATORS)) {
    return { status: 'ok', source: 'keyword-match' };
  }

  try {
    const geocoding = await geocodePickupPoint(trimmedPickupPoint);

    if (!geocoding.found) {
      // Cho phép nếu địa chỉ có cấu trúc hợp lệ (chứa số nhà, đường, quận/huyện/tỉnh)
      return trimmedPickupPoint.length >= 8 ? { status: 'ok', source: 'fallback' } : { status: 'not_found' };
    }

    if (!geocoding.isInVietnam) {
      return { status: 'outside' };
    }

    return { status: 'ok', source: 'geocoding' };
  } catch (error) {
    return { status: 'ok', source: 'offline-allow' };
  }
}

module.exports = {
  verifyPickupPointInHanoi,
};
