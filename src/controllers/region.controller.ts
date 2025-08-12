import { Request, Response } from "express";
import response from "../utils/response";
import RegionModel from "../models/region.model";

export default {
  // ============================================
  // ENDPOINT: Cari kota berdasarkan nama
  // Method: GET
  // ============================================
  async findByCity(req: Request, res: Response) {
    try {
      // Ambil parameter 'name' dari query string URL
      // Contoh: /api/region/search?name=jakarta → name = "jakarta"
      const { name } = req.query;

      // Panggil method findByCity dari model
      // Convert name ke string dengan template literal `${name}`
      const result = await RegionModel.findByCity(`${name}`);

      // Kirim response sukses dengan data result
      response.success(res, result, "success get region by city name");
    } catch (error) {
      // Jika ada error, kirim response error
      response.error(res, error, "failed to get region by city name");
    }
  },

  // ============================================
  // ENDPOINT: Ambil semua provinsi
  // Method: GET
  // ============================================
  async getAllProvinces(req: Request, res: Response) {
    try {
      // Panggil method getAllProvinces dari model
      // Tidak perlu parameter karena ambil semua data
      const result = await RegionModel.getAllProvinces();

      // Kirim response sukses
      response.success(res, result, "success get all provinces");
    } catch (error) {
      // Handle error
      response.error(res, error, "failed to get all provinces");
    }
  },

  // ============================================
  // ENDPOINT: Ambil 1 provinsi beserta kabupaten/kotanya
  // Method: GET
  // ============================================
  async getProvince(req: Request, res: Response) {
    try {
      // Ambil parameter 'id' dari URL path
      // req.params berisi semua parameter dari URL
      const { id } = req.params;

      // Panggil method getProvince dari model
      // Convert id dari string ke number dengan Number()
      const result = await RegionModel.getProvince(Number(id));

      // Kirim response sukses
      response.success(res, result, "success get a province");
    } catch (error) {
      // Handle error
      response.error(res, error, "failed to get province");
    }
  },

  // ============================================
  // ENDPOINT: Ambil 1 kabupaten/kota beserta kecamatannya
  // Method: GET
  // ============================================
  async getRegency(req: Request, res: Response) {
    try {
      // Ambil ID kabupaten/kota dari URL parameter
      const { id } = req.params;

      // Panggil method getRegency dari model
      // Convert string id ke number
      const result = await RegionModel.getRegency(Number(id));

      // Kirim response sukses
      response.success(res, result, "success get regencies");
    } catch (error) {
      // Handle error
      response.error(res, error, "failed to get regency");
    }
  },

  // ============================================
  // ENDPOINT: Ambil 1 kecamatan beserta kelurahannya
  // Method: GET
  // ============================================
  async getDistrict(req: Request, res: Response) {
    try {
      // Ambil ID kecamatan dari URL parameter
      const { id } = req.params;

      // Panggil method getDistrict dari model
      const result = await RegionModel.getDistrict(Number(id));

      // Kirim response sukses
      response.success(res, result, "success get districts");
    } catch (error) {
      // Handle error
      response.error(res, error, "failed to get district");
    }
  },

  // ============================================
  // ENDPOINT: Ambil 1 kelurahan/desa dengan info lengkap
  // Method: GET
  // ============================================
  async getVillage(req: Request, res: Response) {
    try {
      // Ambil ID kelurahan dari URL parameter
      const { id } = req.params;

      // Panggil method getVillage dari model
      const result = await RegionModel.getVillage(Number(id));

      // Kirim response sukses
      response.success(res, result, "success get villages");
    } catch (error) {
      // Handle error
      response.error(res, error, "failed to get village");
    }
  },
};

/* ============================================
   PENJELASAN POLA UMUM CONTROLLER:
   
   1. STRUKTUR ASYNC/AWAIT:
      - Semua method menggunakan async/await untuk handle operasi asynchronous
      - Database query adalah operasi async yang perlu di-await
   
   2. TRY-CATCH PATTERN:
      - Semua method dibungkus try-catch untuk handle error
      - Jika berhasil → response.success()
      - Jika error → response.error()
   
   3. PARAMETER HANDLING:
      - req.query → untuk query string (?name=value)
      - req.params → untuk URL parameter (/api/user/:id)
      - req.body → untuk POST/PUT request body (tidak ada di controller ini)
   
   4. TYPE CONVERSION:
      - req.params dan req.query selalu bertipe string
      - Perlu convert ke number dengan Number() jika dibutuhkan
   
   5. RESPONSE FORMAT:
      - Menggunakan utility response untuk format yang konsisten
      - response.success(res, data, message)
      - response.error(res, error, message)
============================================ */
