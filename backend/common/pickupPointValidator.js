const https = require('https');

const GEOCODING_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const GEOCODING_TIMEOUT_MS = 5000;

const HANOI_INDICATORS = [
  'ha noi',
  'hanoi',
  'ba dinh',
  'hoan kiem',
  'dong da',
  'hai ba trung',
  'cau giay',
  'thanh xuan',
  'hoang mai',
  'long bien',
  'tay ho',
  'ha dong',
  'nam tu liem',
  'bac tu liem',
  'dong anh',
  'gia lam',
  'soc son',
  'me linh',
  'dan phuong',
  'hoai duc',
  'thach that',
  'quoc oai',
  'chuong my',
  'thanh tri',
  'thuong tin',
  'phu xuyen',
  'my duc',
  'ung hoa',
  'ba vi',
  'phuc tho',
  'son tay',
];

const OUTSIDE_HANOI_INDICATORS = [
  'ho chi minh',
  'tp hcm',
  'tphcm',
  'sai gon',
  'da nang',
  'can tho',
  'hai phong',
  'quang ninh',
  'dong nai',
  'binh duong',
  'vung tau',
  'nuoc ngoai',
  'singapore',
  'thailand',
  'japan',
  'korea',
  'usa',
  'new york',
  'tokyo',
];

const geocodingCache = new Map();

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/đ/g, 'd')
    .replace(/[\u0300-\u036f]/g, '')
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
      isInHanoi: false,
    };
  }

  const normalizedValues = collectStrings(geocoding).map(normalizeText);
  const combinedValue = normalizedValues.join(' | ');
  const countryCode = normalizeText(geocoding.country_code);
  const isInVietnam =
    countryCode === 'vn' || combinedValue.includes('viet nam') || combinedValue.includes('vietnam');
  const isInHanoi =
    combinedValue.includes('ha noi') ||
    combinedValue.includes('thanh pho ha noi') ||
    combinedValue.includes('municipality of hanoi');

  return {
    found: true,
    isInVietnam,
    isInHanoi,
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

  if (!trimmedPickupPoint) {
    return { status: 'empty' };
  }

  if (hasKeyword(normalizedPickupPoint, OUTSIDE_HANOI_INDICATORS)) {
    return { status: 'outside' };
  }

  try {
    const geocoding = await geocodePickupPoint(trimmedPickupPoint);

    if (!geocoding.found) {
      return hasKeyword(normalizedPickupPoint, HANOI_INDICATORS)
        ? { status: 'ok', source: 'keyword-fallback' }
        : { status: 'not_found' };
    }

    if (!geocoding.isInVietnam || !geocoding.isInHanoi) {
      return { status: 'outside' };
    }

    return { status: 'ok', source: 'geocoding' };
  } catch (error) {
    if (hasKeyword(normalizedPickupPoint, HANOI_INDICATORS)) {
      return { status: 'ok', source: 'keyword-fallback' };
    }

    return {
      status: 'unverified',
      reason: error.message,
    };
  }
}

module.exports = {
  verifyPickupPointInHanoi,
};
