import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interface";
import CategoryModel, { categoryDTO } from "../models/category.model";
import response from "../utils/response";
import { isValidObjectId } from "mongoose";

export default {
  // ============================================
  // METHOD: CREATE - Buat category baru
  // ============================================
  async create(req: IReqUser, res: Response) {
    try {
      // Validasi data dari request body
      // categoryDTO.validate() akan throw error jika data tidak valid
      await categoryDTO.validate(req.body);

      // Simpan data category baru ke database
      // req.body berisi { name, description, dll } dari client
      const result = await CategoryModel.create(req.body);
      response.success(res, result, "success create category");
    } catch (error) {
      response.error(res, error, "failed create category");
    }
  },

  // ============================================
  // METHOD: FIND ALL - Ambil semua category dengan pagination & search
  // ============================================
  async findAll(req: IReqUser, res: Response) {
    // Destructuring query parameters dengan default values
    const { page = 1, limit = 10, search } = req.query as unknown as IPaginationQuery;
    try {
      // Mulai dengan object kosong, akan diisi filter sesuai kondisi
      const query = {};

      if (search) {
        // Gabungkan filter search ke query menggunakan Object.assign
        Object.assign(query, {
          // $or = kondisi OR dalam MongoDB (cari di name ATAU description)
          $or: [
            // $regex = pencarian dengan pattern regex
            // $options: "i" = case-insensitive (tidak peduli huruf besar/kecil)
            {
              name: { $regex: search, $options: "i" },
            },
            {
              description: { $regex: search, $options: "i" },
            },
          ],
        });
      }
      const result = await CategoryModel.find(query)
        .limit(limit) // Batasi maksimal result sesuai limit
        .skip((page - 1) * limit) // Skip data untuk pagination
        .sort({ createdAt: -1 }) // Urutkan berdasarkan tanggal buat, terbaru dulu
        .exec(); // Eksekusi query dan return Promise

      // Hitung total dokumen yang sesuai filter (tanpa limit)
      // Dibutuhkan untuk hitung total pages dan info pagination lainnya
      const count = await CategoryModel.countDocuments(query);
      response.pagination(
        res,
        result,
        { total: count, totalPages: Math.ceil(count / limit), current: page },
        "success findAll category"
      );
    } catch (error) {
      response.error(res, error, "failed findAll category");
    }
  },

  // ============================================
  // METHOD: FIND ONE - Ambil 1 category berdasarkan ID
  // ============================================
  async findOne(req: IReqUser, res: Response) {
    try {
      // Ambil parameter 'id' dari URL path
      const { id } = req.params;

      // Cari category berdasarkan _id di MongoDB
      // findById() adalah method Mongoose untuk cari berdasarkan ObjectId, Akan return null jika tidak ditemukan
      if (!isValidObjectId(id)) {
        return response.notFound(res, "category not found");
      }
      const result = await CategoryModel.findById(id);

      if (!result) {
        return response.notFound(res, "category not found");
      }

      response.success(res, result, "success findOne category");
    } catch (error) {
      response.error(res, error, "failed findOne category");
    }
  },

  // ============================================
  // METHOD: UPDATE - Update category berdasarkan ID
  // ============================================
  async update(req: IReqUser, res: Response) {
    try {
      // Ambil parameter 'id' dari URL path
      const { id } = req.params;

      // Update category dengan data baru dari req.body
      // findOneAndUpdate(filter, update, options)
      // - filter: { _id: id } = cari dokumen dengan _id = id
      // - update: req.body = data baru untuk replace ganti dengan data dari request body
      // - options: { new: true } = return hasil setelah update
      if (!isValidObjectId(id)) {
        return response.notFound(res, "category id not found");
      }
      const result = await CategoryModel.findOneAndUpdate({ _id: id }, req.body, { new: true });

      response.success(res, result, "success update category");
    } catch (error) {
      response.error(res, error, "failed update category");
    }
  },

  // ============================================
  // METHOD: REMOVE - Hapus category berdasarkan ID
  // ============================================
  async remove(req: IReqUser, res: Response) {
    try {
      // Ambil parameter 'id' dari URL path
      const { id } = req.params;

      // Hapus category berdasarkan id
      // findOneAndDelete() = cari dan hapus dalam 1 operasi atomic
      // Return dokumen yang dihapus (untuk konfirmasi)
      // Jika id tidak ditemukan, return null
      const result = await CategoryModel.findOneAndDelete({ _id: id }, { new: true });
      response.success(res, result, "success remove category");
    } catch (error) {
      response.error(res, error, "failed remove category");
    }
  },
};
