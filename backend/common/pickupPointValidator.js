const https = require('https');

const GEOCODING_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const GEOCODING_TIMEOUT_MS = 5000;

const PROVINCE_MAPPINGS = [
  {
    name: 'Hà Nội',
    keywords: [
      'ha noi', 'hanoi', 'ba dinh', 'hoan kiem', 'dong da', 'hai ba trung', 'cau giay',
      'thanh xuan', 'hoang mai', 'long bien', 'tay ho', 'ha dong', 'nam tu liem', 'bac tu liem',
      'dong anh', 'gia lam', 'soc son', 'me linh', 'dan phuong', 'hoai duc', 'thach that',
      'quoc oai', 'chuong my', 'thanh tri', 'thuong tin', 'phu xuyen', 'my duc', 'ung hoa',
      'ba vi', 'phuc tho', 'son tay', 'noi bai'
    ]
  },
  {
    name: 'TP. Hồ Chí Minh',
    keywords: [
      'ho chi minh', 'hcm', 'sai gon', 'saigon', 'thu duc', 'tan binh', 'binh thanh',
      'go vap', 'phu nhuan', 'tan son nhat', 'tan phu', 'binh tan', 'nha be', 'hoc mon',
      'binh chanh', 'cu chi', 'can gio', 'quan 1', 'quan 2', 'quan 3', 'quan 4', 'quan 5',
      'quan 6', 'quan 7', 'quan 8', 'quan 9', 'quan 10', 'quan 11', 'quan 12'
    ]
  },
  {
    name: 'Đà Nẵng',
    keywords: ['da nang', 'danang', 'hai chau', 'son tra', 'ngu hanh son', 'thanh khe', 'cam le', 'lien chieu', 'hoa vang']
  },
  {
    name: 'Hải Phòng',
    keywords: ['hai phong', 'haiphong', 'hong bang', 'ngo quyen', 'le chan', 'hai an', 'kien an', 'do son', 'thuy nguyen', 'an duong', 'cat ba']
  },
  {
    name: 'Cần Thơ',
    keywords: ['can tho', 'cantho', 'ninh kieu', 'binh thuy', 'cai rang', 'o mon', 'thot not']
  },
  {
    name: 'Khánh Hòa',
    keywords: ['khanh hoa', 'nha trang', 'cam ranh', 'ninh hoa', 'van phong']
  },
  {
    name: 'Lâm Đồng',
    keywords: ['lam dong', 'da lat', 'dalat', 'bao loc', 'duc trong']
  },
  {
    name: 'Bà Rịa - Vũng Tàu',
    keywords: ['vung tau', 'ba ria', 'phu my', 'con dao']
  },
  {
    name: 'Quảng Ninh',
    keywords: ['quang ninh', 'ha long', 'cam pha', 'uong bi', 'mong cai', 'bai chay', 'van don']
  },
  {
    name: 'Bình Dương',
    keywords: ['binh duong', 'thu dau mot', 'thuan an', 'di an', 'ben cat', 'tan uyen']
  },
  {
    name: 'Đồng Nai',
    keywords: ['dong nai', 'bien hoa', 'long thanh', 'nhon trach']
  },
  {
    name: 'Thừa Thiên Huế',
    keywords: ['thua thien hue', 'hue', 'huong thuy', 'huong tra']
  },
  {
    name: 'Kiên Giang',
    keywords: ['kien giang', 'phu quoc', 'rach gia', 'ha tien']
  },
  {
    name: 'Nghệ An',
    keywords: ['nghe an', 'vinh', 'cua lo', 'diendan']
  },
  {
    name: 'Thanh Hóa',
    keywords: ['thanh hoa', 'sam son', 'bim son']
  },
];

const VIETNAM_LOCATION_INDICATORS = [
  ...PROVINCE_MAPPINGS.flatMap((p) => p.keywords),
  'viet nam', 'vietnam', 'san bay', 'ben xe', 'ga tau', 'phuong', 'quan', 'huyen', 'xa',
  'duong', 'pho', 'thi xa', 'thanh pho', 'tinh'
];

const OUTSIDE_VIETNAM_INDICATORS = [
  'nuoc ngoai', 'singapore', 'thailand', 'bangkok', 'japan', 'tokyo', 'korea',
  'seoul', 'usa', 'new york', 'california', 'paris', 'france', 'london', 'england',
  'uk', 'germany', 'berlin', 'china', 'beijing', 'shanghai', 'australia', 'sydney',
  'canada', 'laos', 'cambodia',
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

function hasKeyword(value, keywords = []) {
  return keywords.some((keyword) => value.includes(keyword));
}

function getProvinceFromLocation(text) {
  if (!text) return null;
  const norm = normalizeText(text);
  for (const item of PROVINCE_MAPPINGS) {
    if (hasKeyword(norm, item.keywords)) {
      return item.name;
    }
  }
  return null;
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

  return { url, contactEmail };
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
            reject(new Error(`Status ${response.statusCode}`));
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
    request.setTimeout(GEOCODING_TIMEOUT_MS, () => request.destroy(new Error('Timeout')));
    request.on('error', reject);
  });
}

async function verifyPickupPoint(pickupPoint, carLocation = null) {
  const trimmedPickupPoint = String(pickupPoint || '').trim();
  const normalizedPickupPoint = normalizeText(trimmedPickupPoint);

  if (!trimmedPickupPoint || trimmedPickupPoint.length < 3) {
    return { status: 'empty' };
  }

  if (hasKeyword(normalizedPickupPoint, OUTSIDE_VIETNAM_INDICATORS)) {
    return { status: 'outside_country' };
  }

  // 1. Kiểm tra đối chiếu với vị trí hiện tại của xe
  if (carLocation) {
    const carProvince = getProvinceFromLocation(carLocation);
    const pickupProvince = getProvinceFromLocation(trimmedPickupPoint);

    if (carProvince) {
      const mapping = PROVINCE_MAPPINGS.find((p) => p.name === carProvince);
      const isMatchingProvince = mapping ? hasKeyword(normalizedPickupPoint, mapping.keywords) : false;

      // Nếu điểm đón thuộc tỉnh khác hoàn toàn so với xe
      if (pickupProvince && pickupProvince !== carProvince) {
        return {
          status: 'mismatch',
          carProvince,
          pickupProvince,
          carLocation,
        };
      }

      // Nếu không tìm thấy dấu hiệu trùng tỉnh
      if (!isMatchingProvince && pickupProvince && pickupProvince !== carProvince) {
        return {
          status: 'mismatch',
          carProvince,
          pickupProvince,
          carLocation,
        };
      }
    }
  }

  // 2. Kiểm tra từ khóa hợp lệ tại Việt Nam
  if (hasKeyword(normalizedPickupPoint, VIETNAM_LOCATION_INDICATORS)) {
    return { status: 'ok', source: 'keyword-match' };
  }

  // 3. Fallback cho phép địa chỉ nội địa có độ dài hợp lý
  if (trimmedPickupPoint.length >= 6) {
    return { status: 'ok', source: 'domestic-fallback' };
  }

  return { status: 'not_found' };
}

module.exports = {
  verifyPickupPoint,
  getProvinceFromLocation,
};
