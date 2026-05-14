import { HttpException, Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type JsonObject = Record<string, unknown>;
type DivisionDatasetVersion = 'old' | '2025';
type QueryValue = string | number | null | undefined;

export interface OpenApiDocument extends JsonObject {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
  };
  servers?: Array<{
    url?: string;
  }>;
  paths?: JsonObject;
  components?: {
    schemas?: JsonObject;
  };
}

interface DatasetConfig {
  label: string;
  fileName: string;
  upstreamBaseUrl: string;
}

interface ProvinceWithDistricts extends JsonObject {
  districts?: unknown[];
}

interface DistrictWithWards extends JsonObject {
  wards?: unknown[];
}

const DATASETS: Record<DivisionDatasetVersion, DatasetConfig> = {
  old: {
    label: 'Dữ liệu hành chính cũ trước sáp nhập',
    fileName: 'openapi_old.json',
    upstreamBaseUrl: 'https://provinces.open-api.vn/api/v1'
  },
  2025: {
    label: 'Dữ liệu hành chính mới sau sáp nhập 2025',
    fileName: 'openapi_2025.json',
    upstreamBaseUrl: 'https://provinces.open-api.vn/api/v2'
  }
};

@Injectable()
export class AdministrativeDivisionsService {
  private readonly cache = new Map<DivisionDatasetVersion, OpenApiDocument>();

  getSummary() {
    const oldDocument = this.getDocument('old');
    const newDocument = this.getDocument('2025');

    return {
      datasets: [
        this.createDocumentSummary('old', oldDocument),
        this.createDocumentSummary('2025', newDocument)
      ],
      endpoints: {
        old: [
          'GET /administrative-divisions/old/provinces',
          'GET /administrative-divisions/old/provinces/:code',
          'GET /administrative-divisions/old/districts',
          'GET /administrative-divisions/old/districts/:code',
          'GET /administrative-divisions/old/wards',
          'GET /administrative-divisions/old/wards/:code'
        ],
        2025: [
          'GET /administrative-divisions/2025/provinces',
          'GET /administrative-divisions/2025/provinces/:code',
          'GET /administrative-divisions/2025/wards',
          'GET /administrative-divisions/2025/wards/:code',
          'GET /administrative-divisions/2025/wards/from-legacy',
          'GET /administrative-divisions/2025/wards/:code/to-legacies'
        ]
      },
      comparison: {
        sameContract: false,
        notes: [
          'File cũ dùng /api/v1 và còn tầng quận/huyện.',
          'File mới dùng /api/v2, bỏ tầng quận/huyện và có mapping từ xã/phường cũ sang mới.',
          'File mới có 34 mã tỉnh/thành và 3321 mã xã/phường/đặc khu trong enum.'
        ]
      }
    };
  }

  listOldProvinces(search?: string) {
    if (search) {
      return this.request('old', '/p/search/', { q: search });
    }

    return this.request('old', '/p/');
  }

  getOldProvince(code: number, depth?: number) {
    return this.request('old', `/p/${code}`, { depth });
  }

  async listOldDistricts(provinceCode?: number, search?: string) {
    if (search) {
      return this.request('old', '/d/search/', { q: search, p: provinceCode });
    }

    if (provinceCode) {
      const province = (await this.getOldProvince(
        provinceCode,
        2
      )) as ProvinceWithDistricts;

      return province.districts ?? [];
    }

    return this.request('old', '/d/');
  }

  getOldDistrict(code: number, depth?: number) {
    return this.request('old', `/d/${code}`, { depth });
  }

  async listOldWards(
    districtCode?: number,
    provinceCode?: number,
    search?: string
  ) {
    if (search) {
      return this.request('old', '/w/search/', {
        q: search,
        d: districtCode,
        p: provinceCode
      });
    }

    if (districtCode) {
      const district = (await this.getOldDistrict(
        districtCode,
        2
      )) as DistrictWithWards;

      return district.wards ?? [];
    }

    if (provinceCode) {
      const province = (await this.getOldProvince(
        provinceCode,
        3
      )) as ProvinceWithDistricts;

      return (province.districts ?? []).flatMap((district) =>
        this.isObject(district) && Array.isArray(district.wards)
          ? district.wards
          : []
      );
    }

    return this.request('old', '/w/');
  }

  getOldWard(code: number) {
    return this.request('old', `/w/${code}`);
  }

  list2025Provinces(search?: string) {
    return this.request('2025', '/p/', { search });
  }

  get2025Province(code: number, depth?: number) {
    return this.request('2025', `/p/${code}`, { depth });
  }

  list2025Wards(provinceCode?: number, search?: string) {
    return this.request('2025', '/w/', {
      province: provinceCode,
      search
    });
  }

  get2025Ward(code: number) {
    return this.request('2025', `/w/${code}`);
  }

  lookup2025WardFromLegacy(legacyName?: string, legacyCode?: number) {
    return this.request('2025', '/w/from-legacy/', {
      legacy_name: legacyName,
      legacy_code: legacyCode
    });
  }

  get2025WardLegacies(code: number) {
    return this.request('2025', `/w/${code}/to-legacies/`);
  }

  getOpenApi(version: DivisionDatasetVersion) {
    return this.getDocument(version);
  }

  private async request(
    version: DivisionDatasetVersion,
    path: string,
    query: Record<string, QueryValue> = {}
  ) {
    const url = new URL(`${DATASETS[version].upstreamBaseUrl}${path}`);

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new HttpException(
        {
          message: 'Không lấy được dữ liệu địa giới hành chính',
          upstreamUrl: url.toString(),
          upstreamResponse: payload
        },
        response.status
      );
    }

    return payload;
  }

  private createDocumentSummary(
    version: DivisionDatasetVersion,
    document: OpenApiDocument
  ) {
    const schemas = this.getSchemas(document);
    const provinceCodes =
      version === '2025' ? this.getEnumNumbers(version, 'ProvinceCode') : [];
    const wardCodes =
      version === '2025' ? this.getEnumNumbers(version, 'WardCode') : [];

    return {
      version,
      label: DATASETS[version].label,
      source: DATASETS[version].upstreamBaseUrl,
      openapi: document.openapi ?? null,
      title: document.info?.title ?? null,
      apiVersion: document.info?.version ?? null,
      servers: document.servers ?? [],
      pathCount: Object.keys(document.paths ?? {}).length,
      paths: this.listPaths(document),
      schemaKeys: Object.keys(schemas),
      provinceCodeCount: provinceCodes.length,
      wardCodeCount: wardCodes.length
    };
  }

  private listPaths(document: OpenApiDocument) {
    const paths = document.paths ?? {};

    return Object.entries(paths).flatMap(([path, methods]) => {
      if (!this.isObject(methods)) {
        return [];
      }

      return Object.entries(methods).map(([method, operation]) => ({
        method: method.toUpperCase(),
        path,
        summary: this.isObject(operation)
          ? ((operation.summary as string | undefined) ?? null)
          : null
      }));
    });
  }

  private getEnumNumbers(version: DivisionDatasetVersion, schemaName: string) {
    const document = this.getDocument(version);
    const schema = this.getSchemas(document)[schemaName];

    if (!this.isObject(schema) || !Array.isArray(schema.enum)) {
      return [];
    }

    return schema.enum.filter(
      (value): value is number => typeof value === 'number'
    );
  }

  private getSchemas(document: OpenApiDocument) {
    return document.components?.schemas ?? {};
  }

  private getDocument(version: DivisionDatasetVersion) {
    const cachedDocument = this.cache.get(version);

    if (cachedDocument) {
      return cachedDocument;
    }

    const document = JSON.parse(
      readFileSync(this.getDatasetPath(DATASETS[version].fileName), 'utf8')
    ) as OpenApiDocument;

    this.cache.set(version, document);

    return document;
  }

  private getDatasetPath(fileName: string) {
    const candidates = [
      join(process.cwd(), 'data', 'administrative-divisions', fileName),
      join(__dirname, '../../../data/administrative-divisions', fileName)
    ];

    const datasetPath = candidates.find((candidate) => existsSync(candidate));

    if (!datasetPath) {
      throw new Error(`Không tìm thấy file dữ liệu địa giới: ${fileName}`);
    }

    return datasetPath;
  }

  private isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
