// Import mongoose untuk berinteraksi dengan MongoDB
import mongoose from "mongoose";

// ============================================
// SCHEMA UNTUK KELURAHAN/DESA (Level paling bawah)
// ============================================
const villageSchema = new mongoose.Schema({
  id: { type: Number, index: true }, // ID unik village, dengan index untuk query cepat
  name: String, // Nama kelurahan/desa
}).index({ name: "text" }); // Text index untuk pencarian berdasarkan nama

// ============================================
// SCHEMA UNTUK KECAMATAN (Berisi banyak village)
// ============================================
const districtSchema = new mongoose.Schema({
  id: { type: Number, index: true }, // ID unik kecamatan
  name: String, // Nama kecamatan
  villages: [villageSchema], // Array berisi dokumen village (nested)
}).index({ name: "text" }); // Text index untuk pencarian nama kecamatan

// ============================================
// SCHEMA UNTUK KABUPATEN/KOTA (Berisi banyak district)
// ============================================
const regencySchema = new mongoose.Schema({
  id: { type: Number, index: true }, // ID unik kabupaten/kota
  name: String, // Nama kabupaten/kota
  districts: [districtSchema], // Array berisi dokumen district (nested)
}).index({ name: "text" }); // Text index untuk pencarian nama kabupaten/kota

// ============================================
// SCHEMA UTAMA UNTUK PROVINSI (Level paling atas)
// ============================================
const provinceSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true }, // ID unik provinsi
    name: String, // Nama provinsi
    regencies: [regencySchema], // Array berisi dokumen regency (nested)
  },
  {
    // ============================================
    // STATIC METHODS - Function yang bisa dipanggil langsung dari model
    // Contoh: RegionModel.getAllProvinces()
    // ============================================
    statics: {
      // ============================================
      // METHOD: Cari kabupaten/kota berdasarkan nama
      // Usage: RegionModel.findByCity("Jakarta")
      // ============================================
      findByCity(name: string) {
        return this.aggregate([
          {
            // Bongkar array regencies jadi dokumen terpisah
            // 1 provinsi dengan 5 regency → jadi 5 dokumen terpisah
            $unwind: "$regencies",
          },
          {
            // Filter dokumen yang nama regency-nya mengandung kata yang dicari
            $match: {
              $or: [
                {
                  // Pencarian dengan regex, case-insensitive (huruf besar/kecil tidak masalah)
                  "regencies.name": { $regex: name, $options: "i" },
                },
              ],
            },
          },
          {
            // Pilih field yang mau ditampilkan di hasil akhir
            $project: {
              id: "$regencies.id", // Ambil id dari regency
              name: "$regencies.name", // Ambil name dari regency
            },
          },
          {
            // Ganti struktur root dokumen dengan struktur baru
            $replaceRoot: {
              newRoot: {
                name: "$name",
                id: "$id",
                province: "$province",
                regency: "$regency",
                district: "$district",
              },
            },
          },
        ]);
      },

      // ============================================
      // METHOD: Ambil semua provinsi (hanya id dan nama)
      // Usage: RegionModel.getAllProvinces()
      // ============================================
      getAllProvinces() {
        return this.find({}) // Cari semua dokumen (tanpa filter)
          .select("name id -_id"); // Pilih field name & id, exclude field _id
      },

      // ============================================
      // METHOD: Ambil 1 provinsi beserta semua kabupaten/kotanya
      // Usage: RegionModel.getProvince(31) // 31 = id DKI Jakarta
      // ============================================
      getProvince(id: number) {
        return this.aggregate([
          {
            // Filter provinsi berdasarkan id
            $match: { id },
          },
          {
            // Tentukan field apa saja yang mau ditampilkan
            $project: {
              name: "$name", // Nama provinsi
              id: "$id", // ID provinsi
              regencies: {
                // Transform setiap regency dalam array
                $map: {
                  input: "$regencies", // Array yang mau di-transform
                  as: "regencies", // Nama variable untuk setiap element
                  in: {
                    // Struktur baru untuk setiap regency
                    id: "$$regencies.id", // $$ untuk akses variable
                    name: "$$regencies.name",
                  },
                },
              },
            },
          },
          {
            // Ganti struktur root dokumen
            $replaceRoot: {
              newRoot: {
                name: "$name",
                id: "$id",
                regencies: "$regencies",
              },
            },
          },
        ]);
      }, // end getProvince

      // ============================================
      // METHOD: Ambil 1 kabupaten/kota beserta kecamatan-kecamatannya
      // Usage: RegionModel.getRegency(3171) // 3171 = Jakarta Selatan
      // ============================================
      getRegency(id: number) {
        return this.aggregate([
          {
            // Bongkar array regencies jadi dokumen terpisah
            $unwind: "$regencies",
          },
          {
            // Filter regency berdasarkan id
            $match: {
              "regencies.id": id, // Akses id dalam nested regencies
            },
          },
          {
            // Tentukan struktur output
            $project: {
              name: "$regencies.name", // Nama regency
              id: "$regencies.id", // ID regency
              province: {
                // Info provinsi parent
                id: "$id", // ID provinsi (dari dokumen utama)
                name: "$name", // Nama provinsi (dari dokumen utama)
              },
              districts: {
                // Transform array districts
                $map: {
                  input: "$regencies.districts", // Array districts dari regency
                  as: "districts", // Variable name
                  in: {
                    // Ambil hanya id dan name untuk setiap district
                    id: "$$districts.id",
                    name: "$$districts.name",
                  },
                },
              },
            },
          },
          {
            // Struktur final
            $replaceRoot: {
              newRoot: {
                name: "$name",
                id: "$id",
                province: "$province", // Info provinsi
                districts: "$districts", // List kecamatan
              },
            },
          },
        ]);
      }, // end getRegency

      // ============================================
      // METHOD: Ambil 1 kecamatan beserta kelurahan-kelurahannya
      // Usage: RegionModel.getDistrict(3171010) // Kebayoran Baru
      // ============================================
      getDistrict(id: number) {
        return this.aggregate([
          {
            // Bongkar regencies
            $unwind: "$regencies",
          },
          {
            // Bongkar districts (double unwind karena nested)
            $unwind: "$regencies.districts",
          },
          {
            // Filter district berdasarkan id
            $match: {
              "regencies.districts.id": id, // Path nested yang panjang
            },
          },
          {
            $project: {
              name: "$regencies.districts.name", // Nama kecamatan
              id: "$regencies.districts.id", // ID kecamatan
              province: {
                // Info provinsi
                id: "$id",
                name: "$name",
              },
              regency: {
                // Info kabupaten/kota
                id: "$regencies.id",
                name: "$regencies.name",
              },
              villages: {
                // Transform array villages
                $map: {
                  input: "$regencies.districts.villages", // Path ke villages
                  as: "villages",
                  in: {
                    id: "$$villages.id",
                    name: "$$villages.name",
                  },
                },
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                name: "$name",
                id: "$id",
                province: "$province", // Info provinsi
                regency: "$regency", // Info kabupaten/kota
                villages: "$villages", // List kelurahan/desa
              },
            },
          },
        ]);
      }, // end getDistrict

      // ============================================
      // METHOD: Ambil 1 kelurahan/desa dengan info lengkap parent-nya
      // Usage: RegionModel.getVillage(3171010001) // Gunung Jakarta Selatan
      // ============================================
      getVillage(id: number) {
        return this.aggregate([
          {
            // Triple unwind untuk akses village (level paling dalam)
            $unwind: "$regencies", // Bongkar regencies
          },
          {
            $unwind: "$regencies.districts", // Bongkar districts
          },
          {
            $unwind: "$regencies.districts.villages", // Bongkar villages
          },
          {
            // Filter village berdasarkan id
            $match: {
              "regencies.districts.villages.id": id, // Path nested paling panjang
            },
          },
          {
            $project: {
              name: "$regencies.districts.villages.name", // Nama kelurahan
              id: "$regencies.districts.villages.id", // ID kelurahan
              district: {
                // Info kecamatan
                id: "$regencies.districts.id",
                name: "$regencies.districts.name",
              },
              regency: {
                // Info kabupaten/kota
                id: "$regencies.id",
                name: "$regencies.name",
              },
              province: {
                // Info provinsi
                id: "$id",
                name: "$name",
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                name: "$name",
                id: "$id",
                province: "$province", // Info provinsi
                regency: "$regency", // Info kabupaten/kota
                district: "$district", // Info kecamatan
              },
            },
          },
        ]);
      }, // end getVillage
    }, // end statics
  }
).index({ name: "text" }); // Text index untuk pencarian nama provinsi

// ============================================
// BUAT MODEL DAN EXPORT
// ============================================
// Buat model dengan nama "Region" menggunakan provinceSchema
const RegionModel = mongoose.model("Region", provinceSchema);

// Export model supaya bisa digunakan di file lain
export default RegionModel;
